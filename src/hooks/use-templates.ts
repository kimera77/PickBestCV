'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getJobTemplates, 
  createJobTemplate, 
  updateJobTemplate, 
  deleteJobTemplate 
} from '@/lib/db/actions';
import type { JobTemplate } from '@/lib/types';
import { z } from 'zod';

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

/**
 * Hook to fetch job templates for a user
 */
export function useJobTemplates(userId: string = 'guest') {
  return useQuery({
    queryKey: ['jobTemplates', userId],
    queryFn: async () => {
      console.log('🔍 Fetching templates for userId:', userId);
      const result = await getJobTemplates(userId);
      console.log('✅ Templates fetched:', result.length, 'templates');
      return result;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to create a new job template
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: z.infer<typeof TemplateSchema>) => createJobTemplate(data),
    onSuccess: async () => {
      console.log('🔄 Template created successfully, invalidating cache...');
      // Invalidate and refetch templates after creating
      await queryClient.invalidateQueries({ queryKey: ['jobTemplates'] });
      await queryClient.refetchQueries({ queryKey: ['jobTemplates'] });
      console.log('✅ Cache invalidated and refetched');
    },
    onError: (error) => {
      console.error('❌ Error creating template:', error);
    },
  });
}

/**
 * Hook to update an existing job template
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: z.infer<typeof TemplateUpdateSchema>) => updateJobTemplate(data),
    onSuccess: async () => {
      // Invalidate and refetch templates after updating
      await queryClient.invalidateQueries({ queryKey: ['jobTemplates'] });
      await queryClient.refetchQueries({ queryKey: ['jobTemplates'] });
    },
    onError: (error) => {
      console.error('Error updating template:', error);
    },
  });
}

/**
 * Hook to delete a job template
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, userId }: { templateId: string; userId: string }) => 
      deleteJobTemplate(templateId, userId),
    onSuccess: () => {
      // Invalidate and refetch templates after deleting
      queryClient.invalidateQueries({ queryKey: ['jobTemplates'] });
    },
  });
}
