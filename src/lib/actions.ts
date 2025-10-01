"use server";

import { analyzeSingleCv } from "@/ai/flows/analyze-single-cv";
import { extractTextFromPdf } from "@/ai/flows/extract-text-from-pdf";
import { z } from "zod";
import type { CandidateMatch } from "./types";

const CvFileSchema = z
  .instanceof(File)
  .refine(
    (file) => file.type === "application/pdf",
    "Solo se permiten documentos PDF."
  )
  .refine((file) => file.size > 0, "El archivo del CV no puede estar vacío.");


const FormSchema = z.object({
  jobDescription: z
    .string()
    .min(1, "La descripción del trabajo es obligatoria."),
  cvs: z.array(CvFileSchema).min(1, "Se requiere al menos un CV."),
  language: z.string().optional(),
});

export type FormState = {
  message: string;
  errors?: {
    jobDescription?: string[];
    cvs?: string[];
    _form?: string[];
  };
  analysis?: {
    candidateMatches: CandidateMatch[];
  } | null;
};

async function fileToDataURI(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return `data:${file.type};base64,${base64}`;
}


export async function performCvAnalysis(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const cvFiles = formData.getAll("cvs") as File[];
  const validatedFields = FormSchema.safeParse({
    jobDescription: formData.get("jobDescription"),
    cvs: cvFiles,
    language: formData.get("language"),
  });

  if (!validatedFields.success) {
    return {
      message: "La validación ha fallado. Por favor, comprueba tus datos.",
      errors: validatedFields.error.flatten().fieldErrors,
      analysis: null,
    };
  }

  const { jobDescription, cvs, language } = validatedFields.data;

  try {
    const analysisPromises = cvs.map(async (file) => {
        const cvDataUri = await fileToDataURI(file);
        const result = await analyzeSingleCv({
          jobDescription,
          cv: cvDataUri,
          language: language,
        });
        return { ...result, cv: file.name };
    });

    const results = await Promise.all(analysisPromises);
    const sortedResults = results.sort((a, b) => b.matchScore - a.matchScore);

    return {
      message: "Análisis exitoso.",
      analysis: { candidateMatches: sortedResults },
    };
  } catch (e) {
    console.error(e);
    return {
      message: "Ocurrió un error durante el análisis.",
      errors: {
        _form: [
          "Algo salió mal en el servidor. Por favor, inténtalo de nuevo.",
        ],
      },
      analysis: null,
    };
  }
}

const PdfFileSchema = z
  .instanceof(File)
  .refine(
    (file) => file.type === "application/pdf",
    "Solo se permiten archivos PDF."
  )
  .refine((file) => file.size > 0, "El archivo no puede estar vacío.");

export async function extractTextFromPdfAction(
  formData: FormData
): Promise<{ text?: string; error?: string }> {
  const file = formData.get("pdf");

  const validatedFile = PdfFileSchema.safeParse(file);
  if (!validatedFile.success) {
    return { error: validatedFile.error.flatten().fieldErrors.root?.join(", ") || "Archivo no válido." };
  }

  try {
    const pdfDataUri = await fileToDataURI(validatedFile.data);
    const result = await extractTextFromPdf({ pdf: pdfDataUri });
    return { text: result.extractedText };
  } catch (e) {
    console.error(e);
    return { error: "No se pudo extraer el texto del PDF." };
  }
}
