
"use server";

import { analyzeCVsAgainstJobDescription } from "@/ai/flows/analyze-cvs-against-job-description";
import { z } from "zod";
import type { CandidateMatch } from "./types";
import mammoth from "mammoth";

const CvFileSchema = z
  .instanceof(File)
  .refine(
    (file) =>
      [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(file.type),
    "Solo se permiten documentos PDF y Word."
  )
  .refine((file) => file.size > 0, "El archivo del CV no puede estar vacío.");

const FormSchema = z.object({
  jobDescription: z
    .string()
    .min(1, "La descripción del trabajo es obligatoria."),
  cvs: z.array(CvFileSchema).min(1, "Se requiere al menos un CV."),
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

async function fileToDataURI(file: File) {
  const buffer = await file.arrayBuffer();
  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }
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
  });

  if (!validatedFields.success) {
    return {
      message: "La validación ha fallado. Por favor, comprueba tus datos.",
      errors: validatedFields.error.flatten().fieldErrors,
      analysis: null,
    };
  }

  const { jobDescription, cvs } = validatedFields.data;

  try {
    const cvData = await Promise.all(
      cvs.map(async (file) => ({
        fileName: file.name,
        data: await fileToDataURI(file),
        isText: file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }))
    );

    const result = await analyzeCVsAgainstJobDescription({
      jobDescription,
      cvs: cvData.map((cv) => cv.data),
    });

    const candidateMatchesWithFilenames: CandidateMatch[] =
      result.candidateMatches
        .map((match, index) => {
           // We need to find the original CV based on the index because text-based CVs won't have a data URI to match on.
          const originalCv = cvData[index];
          return {
            ...match,
            cv: originalCv?.fileName || "CV desconocido",
          };
        })
        .sort((a, b) => b.matchScore - a.matchScore);

    return {
      message: "Análisis exitoso.",
      analysis: { candidateMatches: candidateMatchesWithFilenames },
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
