"use client";

import { useState } from "react";
import type { JobTemplate } from "@/lib/types";
import JobTemplates from "./job-templates";
import CvAnalysis from "./cv-analysis";
import { LanguageProvider } from "./language-provider";

const initialTemplates: JobTemplate[] = [
  {
    id: '1',
    title: 'Desarrollador Frontend Senior',
    description: 'Buscamos un desarrollador frontend con más de 5 años de experiencia en React, TypeScript y tecnologías web modernas. La experiencia con Next.js y GraphQL es una ventaja.'
  },
  {
    id: '2',
    title: 'Diseñador UX/UI',
    description: 'Se necesita un diseñador UX/UI creativo para crear experiencias de usuario intuitivas y atractivas. Competente en Figma, Sketch y Adobe Creative Suite.'
  },
    {
    id: '3',
    title: 'Ingeniero Backend Python',
    description: 'Ingeniero Backend con experiencia en Python, Django y APIs REST. Sólidos conocimientos de diseño de bases de datos y arquitectura de microservicios.'
  }
];

export default function DashboardPageClient() {
  const [templates, setTemplates] = useState<JobTemplate[]>(initialTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<JobTemplate | null>(null);

  const handleCreateTemplate = (newTemplate: Omit<JobTemplate, 'id'>) => {
    const templateWithId = { ...newTemplate, id: Date.now().toString() };
    setTemplates(prev => [templateWithId, ...prev]);
  };
  
  return (
    <LanguageProvider>
        <div className="grid flex-1 items-start gap-4 lg:grid-cols-3 xl:grid-cols-3">
            <JobTemplates 
                templates={templates}
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
                onCreateTemplate={handleCreateTemplate}
            />
            <div className="lg:col-span-2 xl:col-span-2">
                <CvAnalysis selectedTemplate={selectedTemplate} />
            </div>
        </div>
    </LanguageProvider>
  );
}
