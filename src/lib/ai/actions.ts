"use server";

import { z } from "zod";
import type { CandidateMatch } from "@/lib/types";
import { analyzeSingleCv } from "@/ai/flows/analyze-single-cv";
import { extractTextFromPdf } from "@/ai/flows/extract-text-from-pdf";
import { logError } from "@/lib/errors";

// --- CV ANALYSIS ACTIONS ---

const CvFileSchema = z
  .instanceof(File)
  .refine(
    (file) => ["application/pdf", "image/jpeg", "image/png"].includes(file.type),
    "Solo se permiten documentos PDF o imágenes (JPG, PNG)."
  )
  .refine((file) => file.size > 0, "El archivo del CV no puede estar vacío.");


const CvAnalysisFormSchema = z.object({
  jobDescription: z
    .string()
    .min(1, "La descripción del trabajo es obligatoria."),
  cvs: z.array(CvFileSchema).min(1, "Se requiere al menos un CV."),
  language: z.string().optional(),
});

export type CvAnalysisFormState = {
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


// Constants for validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_CVS = 20;
const ANALYSIS_TIMEOUT = 30000; // 30 seconds per CV

export async function performCvAnalysis(
  prevState: CvAnalysisFormState,
  formData: FormData
): Promise<CvAnalysisFormState> {
  console.log('🚀 Starting CV analysis...');
  
  const cvFiles = formData.getAll("cvs") as File[];
  
  // Validate number of CVs
  if (cvFiles.length > MAX_CVS) {
    return {
      message: `Solo se pueden analizar hasta ${MAX_CVS} CVs a la vez.`,
      errors: {
        cvs: [`Máximo ${MAX_CVS} CVs permitidos. Has subido ${cvFiles.length}.`],
      },
      analysis: null,
    };
  }
  
  // Validate file sizes
  for (const file of cvFiles) {
    if (file.size > MAX_FILE_SIZE) {
      return {
        message: "Uno o más archivos exceden el tamaño máximo permitido.",
        errors: {
          cvs: [`El archivo "${file.name}" es demasiado grande. Máximo: 10MB`],
        },
        analysis: null,
      };
    }
  }
  
  const validatedFields = CvAnalysisFormSchema.safeParse({
    jobDescription: formData.get("jobDescription"),
    cvs: cvFiles,
    language: formData.get("language"),
  });

  if (!validatedFields.success) {
    console.error('❌ Validation failed:', validatedFields.error);
    return {
      message: "La validación ha fallado. Por favor, comprueba tus datos.",
      errors: validatedFields.error.flatten().fieldErrors,
      analysis: null,
    };
  }

  const { jobDescription, cvs, language } = validatedFields.data;
  console.log(`📊 Analyzing ${cvs.length} CVs for job: ${jobDescription.substring(0, 50)}...`);

  const results: any[] = [];
  const errors: string[] = [];

  // Process CVs sequentially to avoid overwhelming the API
  for (let i = 0; i < cvs.length; i++) {
    const file = cvs[i];
    console.log(`📄 Processing CV ${i + 1}/${cvs.length}: ${file.name}`);
    
    try {
      const startTime = Date.now();
      
      // Convert file to data URI
      const cvDataUri = await fileToDataURI(file);
      
      // Analyze with timeout
      const result = await Promise.race([
        analyzeSingleCv({
          jobDescription,
          cv: cvDataUri,
          language: language || 'es',
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), ANALYSIS_TIMEOUT)
        )
      ]) as any;
      
      const elapsed = Date.now() - startTime;
      console.log(`✅ CV ${i + 1} analyzed in ${elapsed}ms: ${result.candidateName} - Score: ${result.matchScore}`);
      
      results.push({ ...result, cv: file.name });
    } catch (e: any) {
      const errorMsg = e?.message || 'Error desconocido';
      console.error(`❌ Error analyzing CV ${i + 1} (${file.name}):`, e);
      
      logError(e, { action: 'analyzeSingleCv', fileName: file.name, cvIndex: i });
      
      // Add a failed result with error info
      results.push({
        cv: file.name,
        candidateName: `Error: ${file.name}`,
        matchScore: 0,
        reasoning: `No se pudo analizar este CV: ${errorMsg}`,
      });
      
      errors.push(`${file.name}: ${errorMsg}`);
    }
  }

  // Sort results by match score (highest first)
  const sortedResults = results.sort((a, b) => b.matchScore - a.matchScore);
  
  console.log(`🎯 Analysis complete. Successful: ${results.length - errors.length}/${cvs.length}`);

  // If all CVs failed, return error
  if (errors.length === cvs.length) {
    return {
      message: "No se pudo analizar ningún CV.",
      errors: {
        _form: [
          "Todos los CVs fallaron al analizar. Verifica que sean archivos PDF válidos.",
          ...errors.slice(0, 3), // Show first 3 errors
        ],
      },
      analysis: null,
    };
  }

  // Partial success - show warning if some failed
  const message = errors.length > 0 
    ? `Análisis completado con ${errors.length} error(es).`
    : "Análisis exitoso.";

  return {
    message,
    analysis: { candidateMatches: sortedResults },
    ...(errors.length > 0 && {
      errors: {
        _form: [`Algunos CVs no se pudieron analizar: ${errors.join(', ')}`],
      },
    }),
  };
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
    const errors = validatedFile.error.flatten();
    return { error: errors.formErrors.join(", ") || "Archivo no válido." };
  }

  try {
    const pdfDataUri = await fileToDataURI(validatedFile.data);
    const result = await extractTextFromPdf({ pdf: pdfDataUri });
    return { text: result.extractedText };
  } catch (e) {
    logError(e, { action: 'extractTextFromPdfAction' });
    return { error: "No se pudo extraer el texto del PDF." };
  }
}
