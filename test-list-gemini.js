import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function test() {
  try {
     console.log("Checking API key...");
     // Note: There is no native listModels in the SDK sometimes, let's fetch it manually.
     const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
     const data = await res.json();
     console.log("Available models:", JSON.stringify(data, null, 2));
  } catch(e) {
    console.log("FAIL:", e.message);
  }
}

test();
