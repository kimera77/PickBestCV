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
import { createJobTemplate, updateJobTemplate } from "@/lib/db/actions";
import { extractTextFromPdfAction } from "@/lib/actions";
import * as pdfjsLib from 'pdfjs-dist';

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
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = setControlledOpen ?? setInternalOpen;
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionMethod, setExtractionMethod] = useState<'ai' | 'local' | null>(null);

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!templateToEdit;

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

    setIsSaving(true);
    try {
      if (isEditing) {
        await updateJobTemplate({ id: templateToEdit.id, title, description });
      } else {
        await createJobTemplate({ title, description });
      }
      onTemplateSaved();
      toast({
        title: `Plantilla ${isEditing ? 'actualizada' : 'creada'}`,
        description: `La plantilla de trabajo se ha ${isEditing ? 'actualizado' : 'creado'} con éxito.`,
      });
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: `No se pudo ${isEditing ? 'actualizar' : 'crear'} la plantilla. Por favor, inténtalo de nuevo.`,
      });
    } finally {
      setIsSaving(false);
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
        fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
    }
    // Clean up extra spaces and line breaks
    return fullText.replace(/  +/g, ' ').replace(/\n /g, '\n').trim();
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !extractionMethod) return;

    if (file.type !== 'application/pdf') {
        toast({
            variant: "destructive",
            title: "Archivo no válido",
            description: "Por favor, selecciona un archivo PDF.",
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
            title: "Texto extraído",
            description: "La descripción del trabajo se ha rellenado con el contenido del PDF.",
        });
    } catch (error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Error de extracción",
            description: `No se pudo extraer el texto del PDF. ${error instanceof Error ? error.message : ''}`,
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
            {isEditing ? 'Editar' : 'Crear'} plantilla de trabajo
          </DialogTitle>
          <DialogDescription>
              {isEditing ? 'Modifica los detalles de la plantilla de trabajo.' : 'Rellena los detalles para el nuevo puesto de trabajo.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Título
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Ej: Desarrollador WEB Frontend"
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <div className="text-right space-y-2 pt-2">
                <Label htmlFor="description">
                Descripción
                </Label>
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="application/pdf"
                    disabled={isLoading}
                />
                 <div className="flex flex-col gap-2 items-end justify-end">
                    <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleImportClick('local')}
                        disabled={isLoading}
                        className="w-full text-xs"
                    >
                        {isExtracting && extractionMethod === 'local' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Upload className="mr-2 h-4 w-4" />
                        )}
                        Importar PDF
                    </Button>
                    <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleImportClick('ai')}
                        disabled={isLoading}
                        className="w-full text-xs"
                    >
                        {isExtracting && extractionMethod === 'ai' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                        <WandSparkles className="mr-2 h-4 w-4" />
                        )}
                        Importar PDF con IA
                    </Button>
                </div>
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3 min-h-[350px]"
              placeholder="Describe el puesto, las responsabilidades y los requisitos, o importa un PDF."
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline" disabled={isLoading}>Cancelar</Button>
            </DialogClose>
          <Button onClick={handleSave} disabled={!title || !description || isLoading}>
            {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isEditing ? (
                <Save className="mr-2 h-4 w-4" />
            ) : (
                <PlusCircle className="mr-2 h-4 w-4" />
            )}
            {isSaving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear plantilla'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
