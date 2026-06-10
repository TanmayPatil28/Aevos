import { matchInternshipsForProfile } from "./lib/jobs/matcher";
import * as keys from "./lib/ai/keys";

let capturedQuery = "";

// Intercept fetch
const originalFetch = global.fetch;
global.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = input.toString();
  
  if (url.includes("api.tavily.com")) {
    const body = JSON.parse(init?.body as string || "{}");
    capturedQuery = body.query || "";
    
    return new Response(JSON.stringify({
      results: [{ title: "Mock Title", company: "Mock Company", url: "https://mock.url" }]
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  if (url.includes("generativelanguage.googleapis.com")) {
    return new Response(JSON.stringify({
      candidates: [{
        content: {
          parts: [{
            text: JSON.stringify({
              matches: [{ title: "Mock", company: "Mock", url: "https://mock", score: 100, rationale: "Mock" }]
            })
          }]
        }
      }]
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  return originalFetch(input, init);
};

// Mock the keys so it doesn't fail on missing keys
process.env.TAVILY_API_KEY = "mock_tavily";
process.env.GEMINI_API_KEY = "mock_gemini";

async function runTests() {
  const tests = [
    {
      name: "Fallback to default",
      input: {},
      expectedQuery: "software engineering tech internships summer"
    },
    {
      name: "Uses programme and branch",
      input: { academic: { programme: "B.Tech", branch: "CSE" } },
      expectedQuery: "CSE B.Tech internships summer"
    },
    {
      name: "Uses only branch",
      input: { academic: { branch: "Computer Science" } },
      expectedQuery: "Computer Science  internships summer"
    },
    {
      name: "Uses major and skills",
      input: { major: "CS", skills: ["React", "Node", "TypeScript"] },
      expectedQuery: "CS React Node internships summer"
    },
    {
      name: "Empty arrays and strings fallback",
      input: { academic: { programme: "", branch: "" }, major: "", skills: [] },
      expectedQuery: "software engineering tech internships summer"
    },
    {
      name: "Skills but no major",
      input: { skills: ["React", "Node"] },
      expectedQuery: "software engineering tech internships summer"
    },
    {
      name: "Major but no skills",
      input: { major: "CS" },
      expectedQuery: "software engineering tech internships summer"
    }
  ];

  let passed = true;
  for (const t of tests) {
    capturedQuery = "";
    try {
      await matchInternshipsForProfile(t.input);
      if (capturedQuery !== t.expectedQuery) {
        console.error(`❌ Test failed: ${t.name}`);
        console.error(`Expected query: "${t.expectedQuery}"`);
        console.error(`Actual query: "${capturedQuery}"`);
        passed = false;
      } else {
        console.log(`✅ Test passed: ${t.name} (Query: "${capturedQuery}")`);
      }
    } catch (e: any) {
        console.error(`❌ Test failed with exception: ${t.name}`, e.stack);
        passed = false;
    }
  }
  
  if (passed) {
    console.log("ALL TESTS PASSED");
    process.exit(0);
  } else {
    console.log("SOME TESTS FAILED");
    process.exit(1);
  }
}

runTests();
