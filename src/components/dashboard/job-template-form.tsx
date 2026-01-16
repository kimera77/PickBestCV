"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { JobTemplate } from "@/lib/types";
import { PlusCircle, Loader2, Save, Upload, WandSparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromPdfAction } from "@/lib/actions";
import * as pdfjsLib from 'pdfjs-dist';
import { useAuth } from "@/lib/auth/auth-provider";
import { useCreateTemplate, useUpdateTemplate } from "@/hooks/use-templates";
import { logError } from "@/lib/errors";
import { useTranslation } from "@/hooks/use-translation";

// Configure the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;


type JobTemplateFormProps = {
  children?: React.ReactNode;
  templateToEdit?: JobTemplate | null;
  onTemplateSaved: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function JobTemplateForm({ children, templateToEdit, onTemplateSaved, open: controlledOpen, onOpenChange: setControlledOpen }: JobTemplateFormProps) {
  const user = useAuth();
  const { t } = useTranslation();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = setControlledOpen ?? setInternalOpen;
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionMethod, setExtractionMethod] = useState<'ai' | 'local' | null>(null);

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // React Query mutations
  const createTemplateMutation = useCreateTemplate();
  const updateTemplateMutation = useUpdateTemplate();

  const isEditing = !!templateToEdit;
  const isSaving = createTemplateMutation.isPending || updateTemplateMutation.isPending;

  useEffect(() => {
    if (isEditing && open) {
      setTitle(templateToEdit.title);
      setDescription(templateToEdit.description);
    } else {
      setTitle("");
      setDescription("");
    }
  }, [templateToEdit, isEditing, open]);

  const handleSave = async () => {
    if (!title || !description) return;
    
    // Use 'guest' for non-authenticated users, otherwise use real uid
    const userId = user && !user.isAnonymous ? user.uid : 'guest';
    
    console.log('💾 Saving template with userId:', userId);

    try {
      if (isEditing) {
        await updateTemplateMutation.mutateAsync({ 
          id: templateToEdit.id, 
          title, 
          description, 
          userId 
        });
      } else {
        await createTemplateMutation.mutateAsync({ 
          title, 
          description, 
          userId 
        });
      }
      onTemplateSaved();
      toast({
        title: isEditing ? t('templateForm.templateUpdated') : t('templateForm.templateCreated'),
        description: isEditing ? t('templateForm.templateUpdatedDesc') : t('templateForm.templateCreatedDesc'),
      });
      setOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('templateForm.error'),
        description: error instanceof Error ? error.message : `No se pudo ${isEditing ? 'actualizar' : 'crear'} la plantilla.`,
      });
    }
  };

  const extractTextWithAI = async (file: File) => {
    const formData = new FormData();
    formData.append('pdf', file);
    const result = await extractTextFromPdfAction(formData);
    if (result.error) {
        throw new Error(result.error);
    }
    return result.text || "";
  }

  const extractTextLocally = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Sort items by their vertical and then horizontal position
        const items = textContent.items.sort((a: any, b: any) => {
            if (a.transform[5] > b.transform[5]) return -1;
            if (a.transform[5] < b.transform[5]) return 1;
            if (a.transform[4] < b.transform[4]) return -1;
            if (a.transform[4] > b.transform[4]) return 1;
            return 0;
        });

        let lastY = -1;
        for (const item of items) {
            if (!('str' in item)) continue;
            
            const currentY = item.transform[5];
            if (lastY !== -1) {
                const yDiff = Math.abs(currentY - lastY);
                if (yDiff > item.height * 2) { // Large gap -> new section
                    fullText += '\n\n';
                } else if (yDiff > item.height * 0.5) { // Medium gap -> new line
                    fullText += '\n';
                }
            }
            
            fullText += item.str.trim() ? item.str + ' ' : '';
            lastY = currentY;
        }
        fullText += '\n\n'; // Add space between pages
    }
    
    // Clean up extra spaces and line breaks
    return fullText.replace(/ +/g, ' ').replace(/ \n/g, '\n').trim();
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !extractionMethod) return;

    if (file.type !== 'application/pdf') {
        toast({
            variant: "destructive",
            title: t('templateForm.invalidPdf'),
            description: t('templateForm.invalidPdf'),
        });
        return;
    }
    
    setIsExtracting(true);

    try {
        let extractedText = "";
        if (extractionMethod === 'ai') {
             extractedText = await extractTextWithAI(file);
        } else {
             extractedText = await extractTextLocally(file);
        }
       
        setDescription(extractedText);
        toast({
            title: t('templateForm.extractionSuccess'),
            description: t('templateForm.extractionSuccessDesc'),
        });
    } catch (error) {
        logError(error, { action: 'handlePdfUpload', extractionMethod });
        toast({
            variant: "destructive",
            title: t('templateForm.extractionError'),
            description: `${extractionMethod === 'ai' ? t('templateForm.aiExtractionError') : t('templateForm.localExtractionError')}. ${error instanceof Error ? error.message : ''}`,
        });
    } finally {
        setIsExtracting(false);
        setExtractionMethod(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
  };

  const handleImportClick = (method: 'ai' | 'local') => {
    setExtractionMethod(method);
    fileInputRef.current?.click();
  };

  const isLoading = isSaving || isExtracting;


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-primary"/>
            {isEditing ? t('templateForm.editTemplate') : t('templateForm.newTemplate')}
          </DialogTitle>
          <DialogDescription>
              {isEditing ? t('templateForm.editDesc') : t('templateForm.createDesc')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              {t('templateForm.jobTitle')}
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder={t('templateForm.jobTitlePlaceholder')}
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <div className="text-right space-y-2 pt-2">
                <Label htmlFor="description">
                {t('templateForm.jobDescription')}
                </Label>
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="application/pdf"
                    disabled={isLoading}
                />
                 <div className="flex flex-col gap-2 items-end justify-end pt-2">
                    <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleImportClick('local')}
                        disabled={isLoading}
                        className="w-full text-xs justify-center"
                    >
                        {isExtracting && extractionMethod === 'local' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Upload className="mr-2 h-4 w-4" />
                        )}
                        {t('templateForm.extractLocally')}
                    </Button>
                    <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleImportClick('ai')}
                        disabled={isLoading}
                        className="w-full text-xs justify-center"
                    >
                        {isExtracting && extractionMethod === 'ai' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            <WandSparkles className="mr-2 h-4 w-4" />
                        </>
                        )}
                        {t('templateForm.extractWithAI')}
                    </Button>
                </div>
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3 min-h-[350px]"
              placeholder={t('templateForm.jobDescriptionPlaceholder')}
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline" disabled={isLoading}>{t('templateForm.cancel')}</Button>
            </DialogClose>
          <Button onClick={handleSave} disabled={!title || !description || isLoading}>
            {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isEditing ? (
                <Save className="mr-2 h-4 w-4" />
            ) : (
                <PlusCircle className="mr-2 h-4 w-4" />
            )}
            {isSaving ? t('templateForm.saving') : t('templateForm.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
