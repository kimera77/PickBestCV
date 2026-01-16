
"use server";

import { z } from "zod";
import { getAdminFirestore } from "@/firebase/server";
import { revalidatePath } from "next/cache";
import type { JobTemplate } from "../types";
import { requireAuth } from "../auth/actions";
import { AppError, ErrorCodes, logError } from "../errors";
import { DEFAULT_TEMPLATES } from "./default-templates";

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
  try {
    // Require authentication (temporal: no valida en servidor)
    await requireAuth();
    
    // TEMPORAL: Confiar en el userId que viene del cliente
    // TODO: Usar user.uid verificado del servidor cuando se implementen cookies de sesión
    const validatedData = TemplateSchema.parse(data);
    
    console.log('📝 Creating template with userId:', validatedData.userId);
    
    const firestore = await getAdminFirestore();
    const collectionRef = firestore.collection(`jobPositionTemplates`);

    const docRef = await collectionRef.add({
      title: validatedData.title,
      description: validatedData.description,
      userId: validatedData.userId,
      createdAt: new Date(),
    });
    
    console.log('✅ Template created with ID:', docRef.id);

    revalidatePath("/dashboard");
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('❌ Error creating template:', error);
    logError(error, { action: 'createJobTemplate', data });
    throw new AppError(
      'Error al crear la plantilla',
      ErrorCodes.TEMPLATE_CREATE_FAILED,
      500,
      error
    );
  }
}

export async function updateJobTemplate(data: z.infer<typeof TemplateUpdateSchema>) {
  try {
    // Require authentication (temporal: no valida en servidor)
    await requireAuth();
    
    const { id, ...validatedData } = TemplateUpdateSchema.parse(data);
    const firestore = await getAdminFirestore();
    const templateRef = firestore.doc(`jobPositionTemplates/${id}`);
    
    // Verify template exists
    const doc = await templateRef.get();
    if (!doc.exists) {
      throw new AppError('Plantilla no encontrada', ErrorCodes.NOT_FOUND, 404);
    }
    
    // TEMPORAL: No verificar ownership porque requireAuth() retorna uid vacío
    // TODO: Verificar que templateData.userId === user.uid cuando se implementen cookies de sesión
    
    // Only update allowed fields
    const updateData = { 
      title: validatedData.title,
      description: validatedData.description,
      updatedAt: new Date(),
    };

    await templateRef.update(updateData);
    revalidatePath("/dashboard");
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logError(error, { action: 'updateJobTemplate', data });
    throw new AppError(
      'Error al actualizar la plantilla',
      ErrorCodes.TEMPLATE_UPDATE_FAILED,
      500,
      error
    );
  }
}

export async function deleteJobTemplate(templateId: string, userId: string) {
  try {
    // Require authentication (temporal: no valida en servidor)
    await requireAuth();
    
    const firestore = await getAdminFirestore();
    const templateRef = firestore.doc(`jobPositionTemplates/${templateId}`);
    
    // Verify template exists
    const doc = await templateRef.get();
    if (!doc.exists) {
      throw new AppError('Plantilla no encontrada', ErrorCodes.NOT_FOUND, 404);
    }
    
    const templateData = doc.data();
    
    // Prevent deletion of default templates
    if (templateData?.userId === 'default') {
      throw new AppError(
        'No se pueden eliminar las plantillas por defecto',
        ErrorCodes.FORBIDDEN,
        403
      );
    }
    
    // TEMPORAL: No verificar ownership porque requireAuth() retorna uid vacío
    // TODO: Verificar que templateData.userId === userId cuando se implementen cookies de sesión

    await templateRef.delete();
    revalidatePath("/dashboard");
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logError(error, { action: 'deleteJobTemplate', templateId, userId });
    throw new AppError(
      'Error al eliminar la plantilla',
      ErrorCodes.TEMPLATE_DELETE_FAILED,
      500,
      error
    );
  }
}


export async function getJobTemplates(userId: string = 'guest'): Promise<JobTemplate[]> {
  try {
    console.log('📋 Getting templates for userId:', userId);
    
    const firestore = await getAdminFirestore();
    const collectionRef = firestore.collection(`jobPositionTemplates`);
    
    // Fetch user's templates (including 'guest' user templates)
    const querySnapshot = await collectionRef
      .where('userId', '==', userId)
      .orderBy("createdAt", "desc")
      .get();
    
    console.log('📊 Found', querySnapshot.size, 'user templates in Firestore');
    
    const userTemplates: JobTemplate[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('📄 Template doc:', doc.id, 'userId:', data.userId);
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
      userTemplates.push({ 
        id: doc.id, 
        title: data.title,
        description: data.description,
        userId: data.userId,
        createdAt 
      } as JobTemplate);
    });

    // Add default templates with unique IDs
    const defaultTemplatesWithIds: JobTemplate[] = DEFAULT_TEMPLATES.map((template, index) => ({
      ...template,
      id: `default-template-${index + 1}`,
      createdAt: new Date(Date.now() - (index + 1) * 86400000), // Older dates for defaults
    }));

    // Combine user templates with defaults
    // Show user's templates first, then defaults
    const result = [...userTemplates, ...defaultTemplatesWithIds];
    console.log('✅ Returning', result.length, 'total templates');
    
    // Serialize dates to ISO strings for client
    return JSON.parse(JSON.stringify(result, (key, value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    }));

  } catch (error) {
    console.error('❌ Error getting templates:', error);
    logError(error, { action: 'getJobTemplates', userId });
    
    // On error, return default templates as fallback
    const defaultTemplatesWithIds: JobTemplate[] = DEFAULT_TEMPLATES.map((template, index) => ({
      ...template,
      id: `default-template-${index + 1}`,
      createdAt: new Date(Date.now() - (index + 1) * 86400000),
    }));
    
    return JSON.parse(JSON.stringify(defaultTemplatesWithIds, (key, value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    }));
  }
}
