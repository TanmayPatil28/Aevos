import { matchInternshipsForProfile } from "../lib/jobs/matcher.js";

// Mock environment variables
process.env.TAVILY_API_KEY = "tvly-mock-key";
process.env.GEMINI_API_KEY = "AIzaSy-mock-key";

let lastQuery = "";

const originalFetch = global.fetch;
global.fetch = async (url: any, options: any) => {
  const urlStr = url.toString();
  
  if (urlStr.includes("tavily.com")) {
    const body = JSON.parse(options.body as string);
    lastQuery = body.query;
    console.log(`[Tavily Mock] Query captured: "${lastQuery}"`);
    return new Response(JSON.stringify({
      results: [
        { title: "Intern", company: "TestCorp", url: "https://test.com" }
      ]
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  if (urlStr.includes("generativelanguage.googleapis.com")) {
    return new Response(JSON.stringify({
      candidates: [
        {
          content: {
            parts: [{
              text: JSON.stringify({
                matches: [
                  { title: "Intern", company: "TestCorp", url: "https://test.com", score: 90, rationale: "Good match" }
                ]
              })
            }]
          }
        }
      ]
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  return originalFetch(url, options);
};

async function runTests() {
  const testCases = [
    {
      name: "Normal string skills",
      profile: { major: "Computer Science", skills: "Python, Java, C++" },
      expectedQuery: "Computer Science Python, Java, C++ internships summer"
    },
    {
      name: "Array skills",
      profile: { major: "Software Engineering", skills: ["React", "Node.js", "TypeScript"] },
      expectedQuery: "Software Engineering React Node.js internships summer" // Wait, it takes top 2: React Node.js
    },
    {
      name: "Undefined skills",
      profile: { major: "Mathematics" },
      expectedQuery: "software engineering tech internships summer" // Default query
    },
    {
      name: "Empty profile",
      profile: {},
      expectedQuery: "software engineering tech internships summer" // Default query
    },
    {
      name: "Programme and branch present",
      profile: { academic: { programme: "BTech", branch: "Computer Science" }, skills: "Should be ignored", major: "Ignored" },
      expectedQuery: "Computer Science BTech internships summer"
    },
    {
      name: "Single element array",
      profile: { major: "CS", skills: ["Python"] },
      expectedQuery: "CS Python internships summer"
    },
    {
      name: "Number skills (edge case)",
      profile: { major: "CS", skills: 123 },
      expectedQuery: "CS 123 internships summer" // Or might crash but we want to see
    },
    {
      name: "Null profile",
      profile: null,
      expectedQuery: "software engineering tech internships summer"
    }
  ];

  let passed = 0;
  for (const tc of testCases) {
    console.log(`\nTesting: ${tc.name}`);
    lastQuery = "";
    try {
      const results = await matchInternshipsForProfile(tc.profile);
      if (lastQuery === tc.expectedQuery) {
        console.log(`  ✅ Passed. Query matched: "${lastQuery}"`);
        passed++;
      } else {
        console.log(`  ❌ Failed. Expected query: "${tc.expectedQuery}", but got: "${lastQuery}"`);
      }
      if (!Array.isArray(results) || results.length === 0) {
        console.log(`  ⚠️ Warning: returned empty or non-array results:`, results);
      }
    } catch (e) {
      console.log(`  ❌ Failed with exception: ${e}`);
    }
  }

  console.log(`\nSummary: ${passed}/${testCases.length} tests passed.`);
}

runTests().catch(console.error);
