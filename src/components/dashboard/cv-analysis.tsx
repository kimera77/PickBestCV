"use client";

import { useFormStatus } from "react-dom";
import { useActionState, useEffect, useState, useContext } from "react";
import type { JobTemplate } from "@/lib/types";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, WandSparkles } from "lucide-react";
import { performCvAnalysis, type CvAnalysisFormState } from "@/lib/ai/actions";
import { useToast } from "@/hooks/use-toast";
import CvUpload from "./cv-upload";
import AnalysisResults from "./analysis-results";
import { LanguageContext } from "@/components/dashboard/language-provider";

type CvAnalysisProps = {
  selectedTemplate: JobTemplate | null;
};

const initialState: CvAnalysisFormState = {
  message: "",
  analysis: null,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    const { t } = useTranslation();
    return (
        <Button type="submit" disabled={pending} size="lg" className="w-full sm:w-auto font-semibold">
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('cvAnalysis.analyzing')}
                </>
            ) : (
                <>
                    <WandSparkles className="mr-2 h-4 w-4" />
                    {t('cvAnalysis.analyzeCvs')}
                </>
            )}
        </Button>
    )
}

export default function CvAnalysis({ selectedTemplate }: CvAnalysisProps) {
  const [formState, formAction] = useActionState(performCvAnalysis, initialState);
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const { language } = useContext(LanguageContext);
  const { t } = useTranslation();

  useEffect(() => {
    if (formState.message && formState.errors) {
      toast({
        variant: "destructive",
        title: t('cvAnalysis.analysisFailed'),
        description: formState.message,
      });
    }
  }, [formState, toast, t]);

  if (!selectedTemplate) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card">
        <div className="text-center p-8">
          <WandSparkles className="mx-auto h-12 w-12 text-primary/50 mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">{t('cvAnalysis.selectTemplate')}</h3>
          <p className="text-md text-muted-foreground">{t('cvAnalysis.selectTemplateDesc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="jobDescription" value={selectedTemplate.description} />
            <input type="hidden" name="language" value={language.code} />
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span>{t('cvAnalysis.step1')}</span> 
                        {t('cvAnalysis.uploadCvs')}
                    </CardTitle>
                    <CardDescription>
                        {t('cvAnalysis.uploadCvsDesc')} &quot;{selectedTemplate.title}&quot;.
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

        <AnalysisResults 
          result={formState.analysis ?? null} 
          isLoading={useFormStatus().pending}
        />
    </div>
  );
}
