"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { JobTemplate } from "@/lib/types";
import { PlusCircle, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createJobTemplate, updateJobTemplate } from "@/lib/db/actions";

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
  const { toast } = useToast();

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar' : 'Crear'} plantilla de trabajo</DialogTitle>
          <DialogDescription>
             {isEditing ? 'Modifica los detalles de la plantilla de trabajo.' : 'Rellena los detalles para el nuevo puesto de trabajo. Se utilizará para el análisis de CV.'}
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
              placeholder="Ej: Desarrollador Frontend Senior"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3 min-h-[120px]"
              placeholder="Describe el puesto, las responsabilidades y los requisitos."
            />
          </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
            </DialogClose>
          <Button onClick={handleSave} disabled={!title || !description || isSaving}>
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
