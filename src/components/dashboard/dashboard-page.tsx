"use client";

import { useState, useCallback } from "react";
import type { JobTemplate } from "@/lib/types";
import JobTemplates from "./job-templates";
import CvAnalysis from "./cv-analysis";
import { LanguageProvider } from "./language-provider";
import { getJobTemplates } from "@/lib/db/actions";

type DashboardPageClientProps = {
  initialTemplates: JobTemplate[];
}

export default function DashboardPageClient({ initialTemplates }: DashboardPageClientProps) {
  const [templates, setTemplates] = useState<JobTemplate[]>(initialTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<JobTemplate | null>(null);

  const refreshTemplates = useCallback(async () => {
    const freshTemplates = await getJobTemplates();
    setTemplates(freshTemplates);
  }, []);
  
  return (
    <LanguageProvider>
        <div className="grid flex-1 items-start gap-4 lg:grid-cols-3 xl:grid-cols-3">
            <JobTemplates 
                templates={templates}
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
                onTemplateUpdate={refreshTemplates}
            />
            <div className="lg:col-span-2 xl:col-span-2">
                <CvAnalysis selectedTemplate={selectedTemplate} />
            </div>
        </div>
    </LanguageProvider>
  );
}
