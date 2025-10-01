'use server';

/**
 * @fileOverview Extracts and formats text from a PDF document.
 *
 * - extractTextFromPdf - A function that handles the text extraction process.
 * - ExtractTextFromPdfInput - The input type for the extractTextFromPdf function.
 * - ExtractTextFromPdfOutput - The return type for the extractTextFromPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTextFromPdfInputSchema = z.object({
  pdf: z
    .string()
    .describe(
      "A PDF file as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type ExtractTextFromPdfInput = z.infer<
  typeof ExtractTextFromPdfInputSchema
>;

const ExtractTextFromPdfOutputSchema = z.object({
  extractedText: z
    .string()
    .describe('The extracted and formatted text content from the PDF.'),
});

export type ExtractTextFromPdfOutput = z.infer<
  typeof ExtractTextFromPdfOutputSchema
>;

export async function extractTextFromPdf(
  input: ExtractTextFromPdfInput
): Promise<ExtractTextFromPdfOutput> {
  return extractTextFromPdfFlow(input);
}

const extractTextPrompt = ai.definePrompt({
  name: 'extractTextFromPdfPrompt',
  input: {schema: ExtractTextFromPdfInputSchema},
  output: {schema: ExtractTextFromPdfOutputSchema},
  prompt: `You are an expert in document analysis. Your task is to extract all the text from the provided PDF document.

The output should be clean, well-formatted plain text, suitable for being displayed in a textarea. Preserve paragraphs, lists, and general structure, but remove any complex formatting, headers, or footers that are not part of the main content.

PDF:
{{media url=pdf}}

Return the result in JSON format with the key "extractedText".
`,
});

const extractTextFromPdfFlow = ai.defineFlow(
  {
    name: 'extractTextFromPdfFlow',
    inputSchema: ExtractTextFromPdfInputSchema,
    outputSchema: ExtractTextFromPdfOutputSchema,
  },
  async input => {
    const {output} = await extractTextPrompt(input);
    return output!;
  }
);
