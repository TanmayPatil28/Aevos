import { getGeminiKey } from './lib/ai/keys';
console.log('Gemini key:', getGeminiKey());
console.log('System key:', process.env.GOOGLE_GENERATIVE_AI_API_KEY);
