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
  const [selectedTemplate, setSelectedTemplate] = useState<JobTemplate | null>(templates[0] || null);

  const refreshTemplates = useCallback(async () => {
    const freshTemplates = await getJobTemplates();
    setTemplates(freshTemplates);
  }, []);
  
  return (
    <LanguageProvider>
        <div className="flex flex-col lg:flex-row flex-1 items-start gap-4">
            <div className="w-full lg:w-1/3 xl:w-1/3">
                <JobTemplates 
                    templates={templates}
                    selectedTemplate={selectedTemplate}
                    setSelectedTemplate={setSelectedTemplate}
                    onTemplateUpdate={refreshTemplates}
                />
            </div>
            <div className="w-full lg:w-2/3 xl:w-2/3">
                <CvAnalysis selectedTemplate={selectedTemplate} />
            </div>
        </div>
    </LanguageProvider>
  );
}
