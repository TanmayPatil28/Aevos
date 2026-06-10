import { tavily } from "@tavily/core";
import { matchInternshipsForProfile } from "../lib/jobs/matcher";
import "dotenv/config";

// Mock tavily
jest.mock("@tavily/core", () => {
  return {
    tavily: jest.fn().mockImplementation(() => {
      return {
        search: jest.fn().mockImplementation(async (query: string, options: any) => {
          console.log(`[MOCK TAVILY] Query received: "${query}"`);
          return {
            results: [] // empty results so we don't hit Gemini with a large payload
          };
        })
      };
    })
  };
});

async function run() {
  console.log("Testing matcher with a Biology major profile...");
  const bioProfile = {
    major: "Biology",
    gpa: 3.9,
    courses: ["Genetics", "Molecular Biology", "Organic Chemistry", "Anatomy"],
    skills: ["Lab Research", "Microscopy", "Data Analysis", "PCR"]
  };

  try {
    await matchInternshipsForProfile(bioProfile);
  } catch (e) {
    console.log("Error (expected if Gemini rate limited, but we only care about the query):", e.message);
  }
}

run();
