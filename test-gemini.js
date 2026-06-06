import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const res = await model.generateContent("hello");
    console.log("gemini-1.5-flash SUCCESS");
  } catch(e) {
    console.log("gemini-1.5-flash FAIL:", e.message);
  }

  try {
    const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const res2 = await model2.generateContent("hello");
    console.log("gemini-1.5-flash-latest SUCCESS");
  } catch(e) {
    console.log("gemini-1.5-flash-latest FAIL:", e.message);
  }
  
  try {
    const model3 = genAI.getGenerativeModel({ model: "gemini-pro" });
    const res3 = await model3.generateContent("hello");
    console.log("gemini-pro SUCCESS");
  } catch(e) {
    console.log("gemini-pro FAIL:", e.message);
  }
}

test();
