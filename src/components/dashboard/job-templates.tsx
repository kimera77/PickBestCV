"use client";

import type { JobTemplate } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, CheckCircle2 } from "lucide-react";
import JobTemplateForm from "./job-template-form";
import { cn } from "@/lib/utils";

type JobTemplatesProps = {
  templates: JobTemplate[];
  selectedTemplate: JobTemplate | null;
  setSelectedTemplate: (template: JobTemplate | null) => void;
  onCreateTemplate: (template: Omit<JobTemplate, "id">) => void;
};

export default function JobTemplates({
  templates,
  selectedTemplate,
  setSelectedTemplate,
  onCreateTemplate,
}: JobTemplatesProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="grid gap-2">
          <CardTitle>Plantillas de trabajo</CardTitle>
          <CardDescription>
            Selecciona o crea una plantilla para el análisis.
          </CardDescription>
        </div>
        <JobTemplateForm onSave={onCreateTemplate}>
          <Button size="sm" className="gap-1 font-semibold">
            <PlusCircle className="h-4 w-4" />
            Nueva plantilla
          </Button>
        </JobTemplateForm>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            {templates.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                    Aún no se han creado plantillas.
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
                           <div className="grid gap-1">
                             <CardTitle className="text-base font-semibold">{template.title}</CardTitle>
                             <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                           </div>
                           {selectedTemplate?.id === template.id && (
                                <div className="absolute top-3 right-3 h-6 w-6 bg-primary rounded-full text-primary-foreground flex items-center justify-center">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
      </CardContent>
    </Card>
  );
}
