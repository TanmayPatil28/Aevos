import { jarvisAgent } from "./lib/ai/agents/jarvis";
import { getGeminiKey } from "./lib/ai/keys";

async function main() {
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = getGeminiKey();
  
  console.log("Calling jarvisAgent.generate()...");
  let result;
  for (let i=0; i<5; i++) {
    try {
      result = await jarvisAgent.generate("Take me to my attendance page");
      break;
    } catch (e: any) {
      console.log("Retry", i, e.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  if (result) {
    console.log("TEXT:", result.text);
    console.log("TOOL_CALLS:", JSON.stringify(result.toolCalls, null, 2));
    console.log("TOOL_RESULTS:", JSON.stringify(result.toolResults, null, 2));
    
    // Check if Mastra exposes runTool or step results
    console.log("KEYS:", Object.keys(result));
  }
}

main().catch(console.error);
