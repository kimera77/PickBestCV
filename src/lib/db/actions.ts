"use server";

import { z } from "zod";
import { firestore } from "./firebase";
import { getCurrentUser } from "@/lib/auth/actions";
import { revalidatePath } from "next/cache";
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from "firebase/firestore";
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
  const collectionRef = collection(firestore, "jobTemplates");

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

    const templateRef = doc(firestore, "jobTemplates", id);
    
    updateDoc(templateRef, validatedData)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: templateRef.path,
          operation: 'update',
          requestResourceData: validatedData,
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

    const templateRef = doc(firestore, "jobTemplates", templateId);
    
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


export async function getJobTemplates(): Promise<JobTemplate[]> {
    const user = await getCurrentUser();
    if (!user) {
        return [];
    }

    const q = query(collection(firestore, "jobTemplates"), where("userId", "==", user.uid));
    
    try {
        const querySnapshot = await getDocs(q);
        const templates: JobTemplate[] = [];
        querySnapshot.forEach((doc) => {
            templates.push({ id: doc.id, ...doc.data() } as JobTemplate);
        });
        return templates;
    } catch (error) {
         errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
                path: 'jobTemplates',
                operation: 'list',
            })
        );
        // Return empty array or handle as per your app's logic in case of permission errors on read
        return [];
    }
}
