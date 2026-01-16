"use client";

import type { JobTemplate } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, CheckCircle2, MoreVertical, Edit, Trash2 } from "lucide-react";
import JobTemplateForm from "./job-template-form";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth/auth-provider";
import { useDeleteTemplate } from "@/hooks/use-templates";

type JobTemplatesProps = {
  templates: JobTemplate[];
  selectedTemplate: JobTemplate | null;
  setSelectedTemplate: (template: JobTemplate | null) => void;
  onTemplateUpdate: () => void;
  isLoading?: boolean;
};

export default function JobTemplates({
  templates,
  selectedTemplate,
  setSelectedTemplate,
  onTemplateUpdate,
  isLoading = false,
}: JobTemplatesProps) {
  const user = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [editingTemplate, setEditingTemplate] = useState<JobTemplate | null>(null);
  const deleteTemplateMutation = useDeleteTemplate();

  const handleDelete = async (templateId: string) => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Error de autenticación",
            description: "Debes iniciar sesión para eliminar una plantilla.",
        });
        return;
    }
    
    try {
      await deleteTemplateMutation.mutateAsync({ templateId, userId: user.uid });
      toast({
        title: t('templates.templateDeleted'),
        description: t('templates.templateDeletedDesc'),
      });
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('templates.deleteError'),
        description: error instanceof Error ? error.message : "No se pudo eliminar la plantilla.",
      });
    }
  };


  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="grid gap-2">
          <CardTitle>{t('templates.title')}</CardTitle>
          <CardDescription>
            {t('templates.selectTemplateDesc')}
          </CardDescription>
        </div>
         <JobTemplateForm onTemplateSaved={onTemplateUpdate}>
            <Button size="sm" className="gap-1 font-semibold">
              <PlusCircle className="h-4 w-4" />
              {t('templates.newTemplate')}
            </Button>
          </JobTemplateForm>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-4">
            {isLoading ? (
                <div className="text-center text-muted-foreground py-8">
                    <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        <span>{t('common.loading')}</span>
                    </div>
                </div>
            ) : templates.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                    {t('templates.noTemplatesDesc')}
                </div>
            ) : (
                templates.map((template) => (
                    <Card 
                        key={template.id}
                        className={cn(
                            "cursor-pointer hover:border-primary/50 transition-all group",
                            selectedTemplate?.id === template.id && "border-primary ring-2 ring-primary/50"
                        )}
                        onClick={() => setSelectedTemplate(template)}
                    >
                        <CardContent className="p-4 relative">
                           <div className="grid gap-1 pr-8">
                             <CardTitle className="text-base font-semibold">{template.title}</CardTitle>
                             <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                           </div>

                           <div className="absolute top-3 right-3 flex items-center gap-1">
                                {selectedTemplate?.id === template.id && (
                                    <div className="h-6 w-6 bg-primary rounded-full text-primary-foreground flex items-center justify-center">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                )}
                                <AlertDialog>
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-70 group-hover:opacity-100" disabled={template.userId === 'default'}>
                                              <MoreVertical className="h-4 w-4" />
                                          </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <JobTemplateForm 
                                            templateToEdit={template}
                                            onTemplateSaved={() => {
                                                onTemplateUpdate();
                                            }}
                                        >
                                           <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                <Edit className="mr-2 h-4 w-4"/>
                                                <span>{t('templates.edit')}</span>
                                            </DropdownMenuItem>
                                        </JobTemplateForm>
                                        <DropdownMenuSeparator />
                                         <AlertDialogTrigger asChild>
                                           <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                              <Trash2 className="mr-2 h-4 w-4"/>
                                              <span>{t('templates.delete')}</span>
                                          </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>{t('templates.confirmDelete')}</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {t('templates.confirmDeleteDesc')}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>{t('templateForm.cancel')}</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(template.id)} className="bg-destructive hover:bg-destructive/90">{t('templates.delete')}</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
      </CardContent>
       {editingTemplate && (
          <JobTemplateForm
            templateToEdit={editingTemplate}
            onTemplateSaved={() => {
              setEditingTemplate(null);
              onTemplateUpdate();
            }}
            open={!!editingTemplate}
            onOpenChange={(isOpen) => !isOpen && setEditingTemplate(null)}
          />
        )}
    </Card>
  );
}
