"use client";

import { useState } from "react";
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
import { PlusCircle } from "lucide-react";

type JobTemplateFormProps = {
  children: React.ReactNode;
  onSave: (template: Omit<JobTemplate, "id">) => void;
};

export default function JobTemplateForm({ children, onSave }: JobTemplateFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (title && description) {
      onSave({ title, description });
      setTitle("");
      setDescription("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear plantilla de trabajo</DialogTitle>
          <DialogDescription>
            Rellena los detalles para el nuevo puesto de trabajo. Se utilizará para el análisis de CV.
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
          <Button type="submit" onClick={handleSave} disabled={!title || !description}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Guardar plantilla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
