
'use server';

/**
 * @fileOverview Analyzes a single CV against a job description and returns a match score and reasoning.
 *
 * - analyzeSingleCv - A function that handles the analysis process for one CV.
 * - AnalyzeSingleCvInput - The input type for the analyzeSingleCv function.
 * - AnalyzeSingleCvOutput - The return type for the analyzeSingleCv function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSingleCvInputSchema = z.object({
  jobDescription: z.string().describe('The job description to match the CV against.'),
  cv: z
    .string()
    .describe(
      "A single CV as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.string().optional().describe('The language for the response (e.g., "es", "en"). Defaults to "es".'),
});

export type AnalyzeSingleCvInput = z.infer<
  typeof AnalyzeSingleCvInputSchema
>;

const AnalyzeSingleCvOutputSchema = z.object({
  candidateName: z
    .string()
    .describe('The full name of the candidate as extracted from the CV.'),
  matchScore: z.number().describe('The percentage match score (0-100).'),
  reasoning: z
    .string()
    .describe('Explanation of how the match score was determined.'),
});

export type AnalyzeSingleCvOutput = z.infer<
  typeof AnalyzeSingleCvOutputSchema
>;

export async function analyzeSingleCv(
  input: AnalyzeSingleCvInput
): Promise<AnalyzeSingleCvOutput> {
  return analyzeSingleCvFlow(input);
}

const analyzeSingleCvPrompt = ai.definePrompt({
  name: 'analyzeSingleCvPrompt',
  input: {schema: AnalyzeSingleCvInputSchema},
  output: {schema: AnalyzeSingleCvOutputSchema},
  prompt: `You are an expert recruiter. You will analyze a single CV against a job description.

The response MUST be in the specified language: {{{language}}}.

Job Description: {{{jobDescription}}}

CV:
{{media url=cv}}

Extract the candidate's full name, provide a match score (0-100), and a brief explanation of how you determined the score. Return the result in JSON format.
`,
});

const analyzeSingleCvFlow = ai.defineFlow(
  {
    name: 'analyzeSingleCvFlow',
    inputSchema: AnalyzeSingleCvInputSchema,
    outputSchema: AnalyzeSingleCvOutputSchema,
  },
  async input => {
    // Default to Spanish if no language is provided
    const languageToUse = input.language || 'es';
    const {output} = await analyzeSingleCvPrompt({...input, language: languageToUse});
    return output!;
  }
);
