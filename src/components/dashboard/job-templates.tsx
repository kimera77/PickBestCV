"use client";

import type { JobTemplate } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
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
          <CardTitle>Job Templates</CardTitle>
          <CardDescription>
            Select or create a template for analysis.
          </CardDescription>
        </div>
        <JobTemplateForm onSave={onCreateTemplate}>
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            New Template
          </Button>
        </JobTemplateForm>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            {templates.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                    No templates created yet.
                </div>
            ) : (
                templates.map((template) => (
                    <Card 
                        key={template.id}
                        className={cn(
                            "cursor-pointer hover:border-primary transition-colors",
                            selectedTemplate?.id === template.id && "border-primary ring-2 ring-primary"
                        )}
                        onClick={() => setSelectedTemplate(template)}
                    >
                        <CardHeader>
                            <CardTitle className="text-lg">{template.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
      </CardContent>
    </Card>
  );
}
