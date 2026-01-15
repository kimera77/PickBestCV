import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Verify API key is available
const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ ERROR: Google AI API key not found!');
  console.error('Please set one of these environment variables:');
  console.error('  - GOOGLE_GENAI_API_KEY (recommended)');
  console.error('  - GOOGLE_API_KEY');
  console.error('  - GEMINI_API_KEY');
  throw new Error('Missing Google AI API key. Check your .env.local file.');
}

console.log('✅ Google AI API key loaded successfully');
console.log(`🤖 Initializing Genkit with model: googleai/gemini-2.5-flash`);

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});

console.log('✅ Genkit AI initialized successfully');
