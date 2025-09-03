import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const apiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!apiKey || apiKey === 'your_google_genai_api_key_here') {
  console.warn(
    '\n\n🔑 GOOGLE_GENAI_API_KEY not properly configured!' +
    '\n📝 Please follow these steps:' +
    '\n1. Go to https://makersuite.google.com/app/apikey' +
    '\n2. Create a new API key' +
    '\n3. Update your .env file with: GOOGLE_GENAI_API_KEY=your_actual_api_key' +
    '\n4. Restart the development server' +
    '\n\n⚠️  Using demo mode for now...\n\n'
  );
}

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: apiKey || 'demo-key-placeholder',
    }),
  ],
  model: 'googleai/gemini-2.0-flash-exp',
});
