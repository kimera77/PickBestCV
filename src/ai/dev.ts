import { config } from 'dotenv';
config();

import '@/ai/flows/extract-cv-data-points-for-matching.ts';
import '@/ai/flows/analyze-single-cv.ts';
import '@/ai/flows/extract-text-from-pdf.ts';
