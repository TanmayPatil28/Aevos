import { Agent } from '@mastra/core/agent';
import { google } from '@ai-sdk/google';
import { classifyIntentTool } from './tools/intentTool';

export const spotlightAgent = new Agent({
  id: 'spotlight-agent',
  name: 'Spotlight Intent Classifier',
  instructions: `You are the Spotlight Search Intent Classifier. 
Your ONLY job is to classify the user's input.
You MUST call the classify_intent tool to output the result. 
Do not output conversational text.`,
  model: google('gemini-2.5-flash'),
  tools: { classifyIntentTool },
});
