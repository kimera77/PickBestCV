'use server';

/**
 * @fileOverview Analyzes a list of CVs against a job description and returns a ranked list of candidates
 * with a percentage match score.
 *
 * - analyzeCVsAgainstJobDescription - A function that handles the analysis process.
 * - AnalyzeCVsAgainstJobDescriptionInput - The input type for the analyzeCVsAgainstJobDescription function.
 * - AnalyzeCVsAgainstJobDescriptionOutput - The return type for the analyzeCVsAgainstJobDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCVsAgainstJobDescriptionInputSchema = z.object({
  jobDescription: z.string().describe('The job description to match CVs against.'),
  cvs: z
    .array(z.string())
    .describe(
      'An array of CVs, each as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
});

export type AnalyzeCVsAgainstJobDescriptionInput = z.infer<
  typeof AnalyzeCVsAgainstJobDescriptionInputSchema
>;

const CandidateMatchSchema = z.object({
  cv: z.string().describe('The CV data URI.'),
  candidateName: z.string().describe("The full name of the candidate as extracted from the CV."),
  matchScore: z.number().describe('The percentage match score (0-100).'),
  reasoning: z.string().describe('Explanation of how the match score was determined.'),
});

const AnalyzeCVsAgainstJobDescriptionOutputSchema = z.object({
  candidateMatches: z.array(CandidateMatchSchema).describe('A ranked list of candidates with their CVs, names, and match scores.'),
});

export type AnalyzeCVsAgainstJobDescriptionOutput = z.infer<
  typeof AnalyzeCVsAgainstJobDescriptionOutputSchema
>;

export async function analyzeCVsAgainstJobDescription(
  input: AnalyzeCVsAgainstJobDescriptionInput
): Promise<AnalyzeCVsAgainstJobDescriptionOutput> {
  return analyzeCVsAgainstJobDescriptionFlow(input);
}

const analyzeCVsAgainstJobDescriptionPrompt = ai.definePrompt({
  name: 'analyzeCVsAgainstJobDescriptionPrompt',
  input: {schema: AnalyzeCVsAgainstJobDescriptionInputSchema},
  output: {schema: AnalyzeCVsAgainstJobDescriptionOutputSchema},
  prompt: `You are an expert recruiter. You will analyze a list of CVs against a job description and return a ranked list of candidates with a percentage match score.

Job Description: {{{jobDescription}}}

CVs:
{{#each cvs}}
- {{media url=this}}
{{/each}}

For each CV, you will extract the candidate's full name, provide a match score (0-100), and a brief explanation of how you determined the score. Return the results in JSON format.
`,
});

const analyzeCVsAgainstJobDescriptionFlow = ai.defineFlow(
  {
    name: 'analyzeCVsAgainstJobDescriptionFlow',
    inputSchema: AnalyzeCVsAgainstJobDescriptionInputSchema,
    outputSchema: AnalyzeCVsAgainstJobDescriptionOutputSchema,
  },
  async input => {
    const {output} = await analyzeCVsAgainstJobDescriptionPrompt(input);
    return output!;
  }
);
