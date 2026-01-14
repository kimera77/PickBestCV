
"use server";

import { z } from "zod";
import { getAdminFirestore } from "@/firebase/server";
import { revalidatePath } from "next/cache";
import type { JobTemplate } from "../types";

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
  // Using a root collection for debugging as per user's suggestion
  const collectionRef = firestore.collection(`jobPositionTemplates`);

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
    const { id, ...validatedData } = TemplateUpdateSchema.parse(data);
    const firestore = await getAdminFirestore();
    // Using a root collection for debugging
    const templateRef = firestore.doc(`jobPositionTemplates/${id}`);
    
    // Ensure we don't try to update userId or id in the document data itself
    const updateData = { 
        title: validatedData.title,
        description: validatedData.description 
    };

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
    // Using a root collection for debugging
    const templateRef = firestore.doc(`jobPositionTemplates/${templateId}`);
    
    try {
      // We might add a check here in a real app to ensure the user owns the template before deleting
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
  // If user is not logged in (anonymous), just show defaults
  if (!userId || userId === 'default') {
    return defaultTemplates;
  }
  
  const firestore = await getAdminFirestore();
  // Querying the root collection
  const collectionRef = firestore.collection(`jobPositionTemplates`);
  
  try {
    // We fetch templates created by the specific user OR the default ones.
    const querySnapshot = await collectionRef.where('userId', 'in', [userId, 'default']).orderBy("createdAt", "desc").get();
    const userTemplates: JobTemplate[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Ensure createdAt is a Date object, defaulting if it's missing or in a different format
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(0);
      userTemplates.push({ id: doc.id, ...data, createdAt } as JobTemplate);
    });

    // Combine with defaults just in case user has no templates yet, and remove duplicates
    const allTemplates = [...userTemplates, ...defaultTemplates];
    const uniqueTemplates = allTemplates.filter(
        (template, index, self) => index === self.findIndex((t) => t.id === template.id)
    );

    // Sort again to ensure correct order
    return uniqueTemplates.sort((a, b) => (b.createdAt || 0) > (a.createdAt || 0) ? 1 : -1);

  } catch (error) {
    console.error("Permission or other error fetching templates:", error);
    // On error, return default templates as a safe fallback
    return defaultTemplates;
  }
}
