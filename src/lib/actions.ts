"use server";

import { analyzeCVsAgainstJobDescription } from "@/ai/flows/analyze-cvs-against-job-description";
import { z } from "zod";
import type { CandidateMatch } from "./types";

const CvFileSchema = z.instanceof(File).refine(
  (file) =>
    ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type),
  "Only PDF and Word documents are allowed."
).refine((file) => file.size > 0, "CV file cannot be empty.");

const FormSchema = z.object({
  jobDescription: z.string().min(1, "Job description is required."),
  cvs: z.array(CvFileSchema).min(1, "At least one CV is required."),
});

export type FormState = {
  message: string;
  errors?: {
    jobDescription?: string[];
    cvs?: string[];
    _form?: string[];
  };
  analysis?: {
    candidateMatches: CandidateMatch[];
  } | null;
};

async function fileToDataURI(file: File) {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:${file.type};base64,${base64}`;
}

export async function performCvAnalysis(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const cvFiles = formData.getAll("cvs") as File[];
  const validatedFields = FormSchema.safeParse({
    jobDescription: formData.get("jobDescription"),
    cvs: cvFiles,
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed. Please check your inputs.",
      errors: validatedFields.error.flatten().fieldErrors,
      analysis: null,
    };
  }
  
  const { jobDescription, cvs } = validatedFields.data;

  try {
    const dataUriMap = new Map<string, string>();
    const dataUris = await Promise.all(
      cvs.map(async (file) => {
        const uri = await fileToDataURI(file);
        dataUriMap.set(uri, file.name);
        return uri;
      })
    );

    const result = await analyzeCVsAgainstJobDescription({
      jobDescription,
      cvs: dataUris,
    });

    const candidateMatchesWithFilenames: CandidateMatch[] = result.candidateMatches.map(match => ({
      ...match,
      cv: dataUriMap.get(match.cv) || 'Unknown CV',
    })).sort((a, b) => b.matchScore - a.matchScore);

    return {
      message: "Analysis successful.",
      analysis: { candidateMatches: candidateMatchesWithFilenames },
    };
  } catch (e) {
    console.error(e);
    return {
      message: "An error occurred during analysis.",
      errors: {
        _form: ["Something went wrong on the server. Please try again."],
      },
      analysis: null,
    };
  }
}
