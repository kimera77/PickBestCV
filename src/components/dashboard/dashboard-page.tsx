"use client";

import { useState, useEffect } from "react";
import type { JobTemplate } from "@/lib/types";
import JobTemplates from "./job-templates";
import CvAnalysis from "./cv-analysis";
import { useAuth } from "@/lib/auth/auth-provider";
import { useJobTemplates } from "@/hooks/use-templates";

type DashboardPageClientProps = {
  initialTemplates: JobTemplate[];
}

export default function DashboardPageClient({ initialTemplates }: DashboardPageClientProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<JobTemplate | null>(null);
  const user = useAuth();
  
  // Get userId for queries
  const userId = user && !user.isAnonymous ? user.uid : undefined;
  
  // Use React Query to fetch templates
  const { data: templates = initialTemplates, isLoading, refetch } = useJobTemplates(userId);

  // Update selected template when templates change
  useEffect(() => {
    if (!selectedTemplate && templates.length > 0) {
      // No template selected, select the first one
      setSelectedTemplate(templates[0]);
    } else if (selectedTemplate && !templates.find(t => t.id === selectedTemplate.id)) {
      // Selected template was deleted, select first available or null
      setSelectedTemplate(templates.length > 0 ? templates[0] : null);
    }
  }, [templates, selectedTemplate]);
  
  return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1">
              <JobTemplates 
                  templates={templates}
                  selectedTemplate={selectedTemplate}
                  setSelectedTemplate={setSelectedTemplate}
                  onTemplateUpdate={refetch}
                  isLoading={isLoading}
              />
          </div>
          <div className="lg:col-span-2">
              <CvAnalysis selectedTemplate={selectedTemplate} />
          </div>
      </div>
  );
}
