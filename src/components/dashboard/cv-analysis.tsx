"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { JobTemplate } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { performCvAnalysis, type FormState } from "@/lib/actions";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import CvUpload from "./cv-upload";
import AnalysisResults from "./analysis-results";

type CvAnalysisProps = {
  selectedTemplate: JobTemplate | null;
};

const initialState: FormState = {
  message: "",
  analysis: null,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze CVs
                </>
            )}
        </Button>
    )
}

export default function CvAnalysis({ selectedTemplate }: CvAnalysisProps) {
  const [formState, formAction] = useFormState(performCvAnalysis, initialState);
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (formState.message && formState.errors) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: formState.message,
      });
    }
  }, [formState, toast]);

  if (!selectedTemplate) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">Select a job template to begin</p>
          <p className="text-sm text-muted-foreground">Once you select a template, you can upload CVs for analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="jobDescription" value={selectedTemplate.description} />
            <Card>
                <CardHeader>
                    <CardTitle>1. Upload CVs</CardTitle>
                    <CardDescription>
                        Upload the CVs (PDF or Word) you want to analyze against the &quot;{selectedTemplate.title}&quot; position.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CvUpload name="cvs" files={files} setFiles={setFiles} />
                     {formState?.errors?.cvs && (
                        <p className="text-sm font-medium text-destructive mt-2">{formState.errors.cvs[0]}</p>
                     )}
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <SubmitButton />
            </div>

            {formState.errors?._form && (
                 <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{formState.errors._form.join(', ')}</AlertDescription>
                </Alert>
            )}
        </form>

        <AnalysisResults result={formState.analysis} isLoading={useFormStatus().pending} />
    </div>
  );
}
