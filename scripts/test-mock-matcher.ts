import { matchInternshipsForProfile } from "../lib/jobs/matcher";
import * as ai from "ai";
import * as tavilyCore from "@tavily/core";

// Mocking Tavily
const mockSearch = async (query: any, options: any) => {
  console.log(`[Mock] Tavily search called with query: "${query}"`);
  return { results: [{ title: "Software Eng Intern", company: "TechCorp", url: "http" }] };
};

// @ts-ignore
tavilyCore.tavily = () => ({ search: mockSearch });

// Mocking AI generateObject
// @ts-ignore
ai.generateObject = async (options) => {
  console.log(`[Mock] AI generateObject called with prompt length: ${options.prompt.length}`);
  console.log(`[Mock] Prompt excerpt: ${options.prompt.substring(0, 150)}...`);
  return {
    object: {
      matches: [
        {
          title: "Software Eng Intern",
          company: "TechCorp",
          url: "http",
          score: 85,
          rationale: "Good match"
        }
      ]
    }
  };
};

async function runMockTests() {
  console.log("Starting mock tests for matcher...");
  const artProfile = {
    major: "Art History",
    skills: ["Painting"]
  };
  
  await matchInternshipsForProfile(artProfile);
}

runMockTests().catch(console.error);
