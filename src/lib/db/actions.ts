"use server";

import { z } from "zod";
import { firestore } from "./firebase";
import { getCurrentUser } from "@/lib/auth/actions";
import { revalidatePath } from "next/cache";
import { collection, addDoc, serverTimestamp, getDocs, query, where, doc, updateDoc, deleteDoc } from "firebase/firestore";
import type { JobTemplate } from "../types";

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

  await addDoc(collection(firestore, "jobTemplates"), {
    ...validatedData,
    userId: user.uid,
    createdAt: serverTimestamp(),
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
    // You might want to add a security rule to ensure user can only update their own templates
    await updateDoc(templateRef, validatedData);

    revalidatePath("/dashboard");
}

export async function deleteJobTemplate(templateId: string) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("No autenticado");
    }

    const templateRef = doc(firestore, "jobTemplates", templateId);
    // You might want to add a security rule to ensure user can only delete their own templates
    await deleteDoc(templateRef);

    revalidatePath("/dashboard");
}


export async function getJobTemplates(): Promise<JobTemplate[]> {
    const user = await getCurrentUser();
    if (!user) {
        return [];
    }

    const q = query(collection(firestore, "jobTemplates"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    
    const templates: JobTemplate[] = [];
    querySnapshot.forEach((doc) => {
        templates.push({ id: doc.id, ...doc.data() } as JobTemplate);
    });

    return templates;
}
