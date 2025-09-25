import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-cvs-against-job-description.ts';
import '@/ai/flows/extract-cv-data-points-for-matching.ts';