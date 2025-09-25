'use server';
/**
 * @fileOverview This flow extracts key data points from a CV to determine their influence on job matching.
 *
 * - extractCvDataPointsForMatching - A function that orchestrates the CV data extraction and influence assessment.
 * - ExtractCvDataPointsInput - The input type for the extractCvDataPointsForMatching function.
 * - ExtractCvDataPointsOutput - The return type for the extractCvDataPointsForMatching function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractCvDataPointsInputSchema = z.object({
  cvText: z.string().describe('The text content of the CV.'),
  jobDescription: z.string().describe('The job description to match against.'),
});
export type ExtractCvDataPointsInput = z.infer<typeof ExtractCvDataPointsInputSchema>;

const DataPointInfluenceSchema = z.object({
  fieldName: z.string().describe('The name of the data point in the CV.'),
  influenceScore: z.number().describe('A score (0-1) indicating the influence of this data point on the job match. Higher score means more influence.'),
  reason: z.string().describe('Explanation of why this data point is influential.'),
});

const ExtractCvDataPointsOutputSchema = z.object({
  dataPointInfluences: z.array(DataPointInfluenceSchema).describe('An array of data points from the CV and their influence scores for the job match.'),
});
export type ExtractCvDataPointsOutput = z.infer<typeof ExtractCvDataPointsOutputSchema>;

export async function extractCvDataPointsForMatching(
  input: ExtractCvDataPointsInput
): Promise<ExtractCvDataPointsOutput> {
  return extractCvDataPointsForMatchingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractCvDataPointsPrompt',
  input: {schema: ExtractCvDataPointsInputSchema},
  output: {schema: ExtractCvDataPointsOutputSchema},
  prompt: `You are an expert in resume analysis and job matching. Your task is to analyze a CV and a job description to identify the key data points in the CV that are most relevant for determining the candidate's suitability for the job.

CV Text: {{{cvText}}}

Job Description: {{{jobDescription}}}

For each data point you identify, provide a name (fieldName), an influence score (0-1), and a brief explanation (reason) of why it's influential for this particular job.  Return the result as a JSON array. Focus on skills, experience, education, and other qualifications mentioned in the CV that align with the requirements of the job description. Be concise in your reasoning.

Ensure that the influenceScore is appropriate - for example, if the job description mentions a specific skill that is also highlighted in the CV, the influenceScore should be high. Conversely, if a skill or experience is irrelevant to the job description, the influenceScore should be low.

Your response should be in JSON format.
`, 
});

const extractCvDataPointsForMatchingFlow = ai.defineFlow(
  {
    name: 'extractCvDataPointsForMatchingFlow',
    inputSchema: ExtractCvDataPointsInputSchema,
    outputSchema: ExtractCvDataPointsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
