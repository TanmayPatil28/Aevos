import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: 'Hello'
    });
    console.log('gemini-1.5-flash works:', text);
  } catch(e) { console.error('flash failed:', e.message); }
  
  try {
    const { text } = await generateText({
      model: google('gemini-1.5-flash-latest'),
      prompt: 'Hello'
    });
    console.log('gemini-1.5-flash-latest works:', text);
  } catch(e) { console.error('flash-latest failed:', e.message); }

  try {
    const { text } = await generateText({
      model: google('gemini-1.5-pro'),
      prompt: 'Hello'
    });
    console.log('gemini-1.5-pro works:', text);
  } catch(e) { console.error('pro failed:', e.message); }
}
run();
