import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

let aiInstance: ReturnType<typeof genkit> | null = null;

function getAI() {
  if (aiInstance) {
    return aiInstance;
  }

  // Verify API key is available (only when AI is actually used)
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

  aiInstance = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-2.5-flash',
  });

  console.log('✅ Genkit AI initialized successfully');
  
  return aiInstance;
}

export const ai = new Proxy({} as ReturnType<typeof genkit>, {
  get(target, prop) {
    return getAI()[prop as keyof ReturnType<typeof genkit>];
  }
});
