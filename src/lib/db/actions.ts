"use server";

import { z } from "zod";
import { firestore } from "./firebase";
import { revalidatePath } from "next/cache";
import { collection, addDoc, getDocs, query, doc, updateDoc, deleteDoc } from "firebase/firestore";
import type { JobTemplate } from "../types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { getCurrentUser } from "../auth/actions";


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

  try {
    await addDoc(collectionRef, {
      title: validatedData.title,
      description: validatedData.description,
      userId: validatedData.userId,
      createdAt: new Date(),
    });
  } catch (error) {
    const user = await getCurrentUser();
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: collectionRef.path,
        operation: 'create',
        requestResourceData: { ...validatedData, createdAt: "Firestore.FieldValue.serverTimestamp()" },
        auth: user
      })
    )
    // Re-throw or handle as needed
    throw error;
  }

  revalidatePath("/dashboard");
}

export async function updateJobTemplate(data: z.infer<typeof TemplateUpdateSchema>) {
    const { id, userId, ...validatedData } = TemplateUpdateSchema.parse(data);

    const templateRef = doc(firestore, "users", userId, "jobTemplates", id);
    
    const updateData = { ...validatedData };

    try {
      await updateDoc(templateRef, updateData)
    } catch(error) {
      const user = await getCurrentUser();
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: templateRef.path,
          operation: 'update',
          requestResourceData: updateData,
          auth: user,
        })
      )
      throw error;
    }

    revalidatePath("/dashboard");
}

export async function deleteJobTemplate(templateId: string, userId: string) {
    if (!userId) {
        throw new Error("No autenticado");
    }

    const templateRef = doc(firestore, "users", userId, "jobTemplates", templateId);
    
    try {
      await deleteDoc(templateRef)
    } catch(error) {
       const user = await getCurrentUser();
        errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
            path: templateRef.path,
            operation: 'delete',
            auth: user
        })
        )
        throw error;
    }

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
    const userTemplates: JobTemplate[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
      userTemplates.push({ id: doc.id, ...data, createdAt } as JobTemplate);
    });

    const sortedUserTemplates = userTemplates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (sortedUserTemplates.length === 0) {
      const defaultTemplates = [
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
      return defaultTemplates;
    }

    return sortedUserTemplates;

  } catch (error) {
    console.error("Permission or other error fetching templates:", error);
    const user = await getCurrentUser();
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: collectionRef.path,
      operation: 'list',
      auth: user,
    }));
    return [];
  }
}
    