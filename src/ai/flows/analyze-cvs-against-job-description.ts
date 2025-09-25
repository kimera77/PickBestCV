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
      'An array of CVs. Each CV can be a data URI for a PDF (data:<mimetype>;base64,<encoded_data>) or plain text for other document types.'
    ),
});

export type AnalyzeCVsAgainstJobDescriptionInput = z.infer<
  typeof AnalyzeCVsAgainstJobDescriptionInputSchema
>;

const CandidateMatchSchema = z.object({
  candidateName: z.string().describe("The full name of the candidate as extracted from the CV."),
  matchScore: z.number().describe('The percentage match score (0-100).'),
  reasoning: z.string().describe('Explanation of how the match score was determined.'),
});

const AnalyzeCVsAgainstJobDescriptionOutputSchema = z.object({
  candidateMatches: z.array(CandidateMatchSchema).describe('A ranked list of candidates with their names and match scores.'),
});

export type AnalyzeCVsAgainstJobDescriptionOutput = z.infer<
  typeof AnalyzeCVsAgainstJobDescriptionOutputSchema
>;

export async function analyzeCVsAgainstJobDescription(
  input: AnalyzeCVsAgainstJobDescriptionInput
): Promise<AnalyzeCVsAgainstJobDescriptionOutput> {
  return analyzeCVsAgainstJobDescriptionFlow(input);
}

function isDataUri(str: string): boolean {
  return str.startsWith('data:');
}

const analyzeCVsAgainstJobDescriptionPrompt = ai.definePrompt({
  name: 'analyzeCVsAgainstJobDescriptionPrompt',
  input: {schema: AnalyzeCVsAgainstJobDescriptionInputSchema},
  output: {schema: AnalyzeCVsAgainstJobDescriptionOutputSchema},
  prompt: `You are an expert recruiter. You will analyze a list of CVs against a job description and return a ranked list of candidates with a percentage match score.

Job Description: {{{jobDescription}}}

CVs:
{{#each cvs}}
- {{#if (isDataUri this)}}{{media url=this}}{{else}}{{{this}}}{{/if}}
{{/each}}

For each CV, you will extract the candidate's full name, provide a match score (0-100), and a brief explanation of how you determined the score. Return the results in JSON format.
`,
}, { isDataUri });

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
