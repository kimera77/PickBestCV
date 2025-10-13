"use client";

import { useState, useCallback, useEffect } from "react";
import type { JobTemplate } from "@/lib/types";
import JobTemplates from "./job-templates";
import CvAnalysis from "./cv-analysis";
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
    // If there was no selected template, or the selected one was deleted,
    // select the first one from the fresh list.
    if ((!selectedTemplate || !freshTemplates.find(t => t.id === selectedTemplate.id)) && freshTemplates.length > 0) {
      setSelectedTemplate(freshTemplates[0]);
    } else if (freshTemplates.length === 0) {
      setSelectedTemplate(null);
    }
  }, [selectedTemplate]);

  // Fetch templates on initial mount
  useEffect(() => {
    refreshTemplates();
  }, []); // Empty dependency array ensures this runs only once on mount
  
  return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1">
              <JobTemplates 
                  templates={templates}
                  selectedTemplate={selectedTemplate}
                  setSelectedTemplate={setSelectedTemplate}
                  onTemplateUpdate={refreshTemplates}
              />
          </div>
          <div className="lg:col-span-2">
              <CvAnalysis selectedTemplate={selectedTemplate} />
          </div>
      </div>
  );
}
