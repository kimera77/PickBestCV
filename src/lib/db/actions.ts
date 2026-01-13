"use server";

import { z } from "zod";
import { firestore } from "./firebase";
import { getCurrentUser } from "@/lib/auth/actions";
import { revalidatePath } from "next/cache";
import { collection, addDoc, getDocs, query, doc, updateDoc, deleteDoc } from "firebase/firestore";
import type { JobTemplate } from "../types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const TemplateSchema = z.object({
  title: z.string().min(1, "El título es obligatorio."),
  description: z.string().min(1, "La descripción es obligatoria."),
});

const TemplateUpdateSchema = TemplateSchema.extend({
    id: z.string().min(1),
});

export async function createJobTemplate(data: z.infer<typeof TemplateSchema>) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("No autenticado");
  }

  const validatedData = TemplateSchema.parse(data);
  const collectionRef = collection(firestore, "users", user.uid, "jobTemplates");

  addDoc(collectionRef, {
    ...validatedData,
    userId: user.uid,
    createdAt: new Date(),
  }).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: collectionRef.path,
        operation: 'create',
        requestResourceData: { ...validatedData, userId: user.uid },
      })
    )
  });

  revalidatePath("/dashboard");
}

export async function updateJobTemplate(data: z.infer<typeof TemplateUpdateSchema>) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("No autenticado");
    }

    const { id, ...validatedData } = TemplateUpdateSchema.parse(data);

    const templateRef = doc(firestore, "users", user.uid, "jobTemplates", id);
    
    // When updating, we should not include the userId, as it's immutable.
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

export async function deleteJobTemplate(templateId: string) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("No autenticado");
    }

    const templateRef = doc(firestore, "users", user.uid, "jobTemplates", templateId);
    
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
  let templates: JobTemplate[] = [];

  try {
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      templates.push({ id: doc.id, ...doc.data() } as JobTemplate);
    });
  } catch (error) {
    console.error("Permission error fetching templates:", error);
    // Don't re-throw, just return empty or default data
  }

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
}
