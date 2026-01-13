"use server";

import { z } from "zod";
import { firestore } from "./firebase";
import { revalidatePath } from "next/cache";
import { collection, addDoc, getDocs, query, doc, updateDoc, deleteDoc, where } from "firebase/firestore";
import type { JobTemplate } from "../types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

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
  const collectionRef = collection(firestore, "users", validatedData.userId, "jobTemplates");

  addDoc(collectionRef, {
    title: validatedData.title,
    description: validatedData.description,
    userId: validatedData.userId,
    createdAt: new Date(),
  }).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: collectionRef.path,
        operation: 'create',
        requestResourceData: { ...validatedData },
      })
    )
  });

  revalidatePath("/dashboard");
}

export async function updateJobTemplate(data: z.infer<typeof TemplateUpdateSchema>) {
    const { id, userId, ...validatedData } = TemplateUpdateSchema.parse(data);

    const templateRef = doc(firestore, "users", userId, "jobTemplates", id);
    
    const updateData = { ...validatedData };

    updateDoc(templateRef, updateData)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: templateRef.path,
          operation: 'update',
          requestResourceData: updateData,
        })
      )
    });

    revalidatePath("/dashboard");
}

export async function deleteJobTemplate(templateId: string, userId: string) {
    if (!userId) {
        throw new Error("No autenticado");
    }

    const templateRef = doc(firestore, "users", userId, "jobTemplates", templateId);
    
    deleteDoc(templateRef)
    .catch(error => {
        errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
            path: templateRef.path,
            operation: 'delete',
        })
        )
    });

    revalidatePath("/dashboard");
}


export async function getJobTemplates(userId: string): Promise<JobTemplate[]> {
  if (!userId) {
    return [];
  }

  const collectionRef = collection(firestore, `users/${userId}/jobTemplates`);
  const q = query(collectionRef);
  
  try {
    const querySnapshot = await getDocs(q);
    const templates: JobTemplate[] = [];
    querySnapshot.forEach((doc) => {
      templates.push({ id: doc.id, ...doc.data() } as JobTemplate);
    });

    // If the user has no templates, provide a default one.
    if (templates.length === 0) {
      templates.push({
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
      });
    }

    return templates;

  } catch (error) {
    console.error("Permission error fetching templates:", error);
    // In case of a permission error (e.g., for anonymous users on a fresh start),
    // just return the default template.
    return [{
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
    }];
  }
}
