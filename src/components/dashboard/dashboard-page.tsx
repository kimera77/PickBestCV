"use client";

import { useState } from "react";
import type { JobTemplate } from "@/lib/types";
import JobTemplates from "./job-templates";
import CvAnalysis from "./cv-analysis";

const initialTemplates: JobTemplate[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    description: 'Seeking a skilled frontend developer with 5+ years of experience in React, TypeScript, and modern web technologies. Experience with Next.js and GraphQL is a plus.'
  },
  {
    id: '2',
    title: 'UX/UI Designer',
    description: 'Creative UX/UI designer needed to create intuitive and beautiful user experiences. Proficient in Figma, Sketch, and Adobe Creative Suite.'
  },
    {
    id: '3',
    title: 'Backend Python Engineer',
    description: 'Experienced Backend Engineer specializing in Python, Django, and REST APIs. Strong understanding of database design and microservices architecture.'
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
  );
}
