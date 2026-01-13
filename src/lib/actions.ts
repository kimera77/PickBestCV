"use server";

import { z } from "zod";
import { getAdminFirestore } from "@/firebase/server";
import { revalidatePath } from "next/cache";
import type { JobTemplate, CandidateMatch } from "./types";
import { analyzeSingleCv } from "@/ai/flows/analyze-single-cv";
import { extractTextFromPdf } from "@/ai/flows/extract-text-from-pdf";

// --- JOB TEMPLATE ACTIONS ---

const TemplateSchema = z.object({
  title: z.string().min(1, "El título es obligatorio."),
  description: z.string().min(1, "La descripción es obligatoria."),
  userId: z.string().min(1, "Se requiere el ID de usuario.")
});

const TemplateUpdateSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1, "El título es obligatorio."),
    description: z.string().min(1, "La descripción es obligatoria."),
    userId: z.string().min(1, "Se requiere el ID de usuario.")
});

export async function createJobTemplate(data: z.infer<typeof TemplateSchema>) {
  const validatedData = TemplateSchema.parse(data);
  const firestore = await getAdminFirestore();
  const collectionRef = firestore.collection(`users/${validatedData.userId}/jobTemplates`);

  try {
    await collectionRef.add({
      title: validatedData.title,
      description: validatedData.description,
      userId: validatedData.userId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Error creating job template:", error);
    // Re-throw or handle as needed
    throw error;
  }

  revalidatePath("/dashboard");
}

export async function updateJobTemplate(data: z.infer<typeof TemplateUpdateSchema>) {
    const { id, userId, ...validatedData } = TemplateUpdateSchema.parse(data);
    const firestore = await getAdminFirestore();
    const templateRef = firestore.doc(`users/${userId}/jobTemplates/${id}`);
    
    const updateData = { ...validatedData };

    try {
      await templateRef.update(updateData);
    } catch(error) {
      console.error("Error updating job template:", error);
      throw error;
    }

    revalidatePath("/dashboard");
}

export async function deleteJobTemplate(templateId: string, userId: string) {
    if (!userId) {
        throw new Error("No autenticado");
    }
    const firestore = await getAdminFirestore();
    const templateRef = firestore.doc(`users/${userId}/jobTemplates/${templateId}`);
    
    try {
      await templateRef.delete();
    } catch(error) {
       console.error("Error deleting job template:", error);
       throw error;
    }

    revalidatePath("/dashboard");
}


const defaultTemplates: JobTemplate[] = [
    {
      id: "default-template-1",
      title: "Profesor/a de Secundaria",
      description: `Buscamos un/a profesor/a de secundaria entusiasta y dedicado/a para unirse a nuestro equipo.

Responsabilidades:
- Impartir clases de [Asignatura] a estudiantes de secundaria.
- Preparar y calificar exámenes, trabajos y proyectos.
- Crear un ambiente de aprendizaje positivo e inclusivo.
- Colaborar con otros profesores y personal del centro.

Requisitos:
- Grado en [Área de estudio] o similar.
- Máster en Formación del Profesorado o CAP.
- Excelentes habilidades de comunicación y organización.
- Pasión por la enseñanza y el desarrollo de los jóvenes.`,
      userId: "default",
      createdAt: new Date('2024-01-01T10:00:00Z'),
    },
    {
      id: "default-template-2",
      title: "Ingeniero/a de Software",
      description: `Buscamos un/a Ingeniero/a de Software con talento para diseñar, desarrollar y mantener software de alta calidad.

Responsabilidades:
- Escribir código limpio, mantenible y eficiente.
- Colaborar con equipos multifuncionales para definir y enviar nuevas características.
- Solucionar problemas y depurar aplicaciones.
- Mejorar continuamente las prácticas de desarrollo.

Requisitos:
- Experiencia con JavaScript/TypeScript, React y Node.js.
- Conocimiento de bases de datos SQL y NoSQL.
- Familiaridad con metodologías ágiles.
- Pasión por la tecnología y la resolución de problemas.`,
      userId: "default",
      createdAt: new Date('2024-01-01T09:00:00Z'),
    },
    {
      id: "default-template-3",
      title: "Diseñador/a Gráfico/a",
      description: `Buscamos un/a diseñador/a gráfico/a creativo/a para producir contenido visual atractivo.

Responsabilidades:
- Crear gráficos para redes sociales, sitios web y campañas de marketing.
- Desarrollar ilustraciones, logotipos y otros diseños.
- Colaborar con el equipo para asegurar la coherencia de la marca.
- Estar al día de las últimas tendencias de diseño.

Requisitos:
- Portfolio sólido de proyectos de diseño gráfico.
- Dominio de Adobe Creative Suite (Photoshop, Illustrator, InDesign).
- Excelentes habilidades de comunicación visual.
- Atención al detalle y creatividad.`,
      userId: "default",
      createdAt: new Date('2024-01-01T08:00:00Z'),
    }
];

export async function getJobTemplates(userId?: string): Promise<JobTemplate[]> {
  if (!userId) {
    return defaultTemplates;
  }
  
  const firestore = await getAdminFirestore();
  const collectionRef = firestore.collection(`users/${userId}/jobTemplates`);
  
  try {
    const querySnapshot = await collectionRef.orderBy("createdAt", "desc").get();
    const userTemplates: JobTemplate[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(0);
      userTemplates.push({ id: doc.id, ...data, createdAt } as JobTemplate);
    });

    if (userTemplates.length === 0) {
      return defaultTemplates;
    }
    
    return userTemplates;

  } catch (error) {
    console.error("Permission or other error fetching templates for user:", userId, error);
    return defaultTemplates;
  }
}


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


export async function performCvAnalysis(
  prevState: CvAnalysisFormState,
  formData: FormData
): Promise<CvAnalysisFormState> {
  const cvFiles = formData.getAll("cvs") as File[];
  const validatedFields = CvAnalysisFormSchema.safeParse({
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
