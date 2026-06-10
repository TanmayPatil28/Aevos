import { tavily } from "@tavily/core";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { getTavilyKey, getGeminiKey } from "../ai/keys";

export async function matchInternshipsForProfile(academicProfile: any) {
  try {
    // 1. Initialize Tavily and Search
    const tvly = tavily({ apiKey: getTavilyKey() });
    
    // Extract key skills or interests from the profile to form a better query,
    // or default to a general software engineering internship query.
    let query = "software engineering tech internships summer";
    const programme = academicProfile?.academic?.programme || "";
    const branch = academicProfile?.academic?.branch || "";
    if (programme || branch) {
      query = `${branch} ${programme} internships summer`.trim();
    } else if (academicProfile?.skills && academicProfile?.major) {
      const skillsArr = Array.isArray(academicProfile.skills) ? academicProfile.skills : [academicProfile.skills];
      query = `${academicProfile.major} ${skillsArr.slice(0, 2).join(" ")} internships summer`.trim();
    }
    
    const searchResponse = await tvly.search(query, {
      searchDepth: "advanced",
      limit: 10,
    });

    const searchResultsText = JSON.stringify(searchResponse.results, null, 2);

    // 2. Initialize Gemini
    const google = createGoogleGenerativeAI({
      apiKey: getGeminiKey(),
    });

    // 3. Evaluate results against academicProfile
    const profileText = JSON.stringify(academicProfile, null, 2);

    const { object } = await generateObject({
      model: google('gemini-2.5-flash-lite'),
      schema: z.object({
        matches: z.array(
          z.object({
            title: z.string(),
            company: z.string(),
            url: z.string(),
            score: z.number().describe("A score from 0 to 100 indicating how well the internship matches the profile"),
            rationale: z.string().describe("A brief explanation of why this is a good match based on the user's coursework and skills")
          })
        )
      }),
      prompt: `You are an expert career counselor. Evaluate the following internship search results against the student's academic profile.

      Academic Profile:
      ${profileText}

      Search Results:
      ${searchResultsText}

      Return an array of the best matching internships. For each, provide the title, company, url, a match score (0-100), and a brief rationale explaining why it matches their skills and coursework.`
    });

    return object.matches;
  } catch (error) {
    console.error("Error in matchInternshipsForProfile:", error);
    return [];
  }
}
