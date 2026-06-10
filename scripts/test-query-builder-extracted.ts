import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const matcherPath = path.join(__dirname, "../lib/jobs/matcher.ts");
const matcherCode = fs.readFileSync(matcherPath, "utf-8");

const queryLogicMatch = matcherCode.match(/let query = "software engineering tech internships summer";[\s\S]*?const searchResponse = await tvly\.search\(query/);
if (!queryLogicMatch) throw new Error("Could not find query logic in matcher.ts");

const queryLogic = queryLogicMatch[0].replace("const searchResponse = await tvly.search(query", "return query;");

const testFn = new Function("academicProfile", queryLogic);

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
      expectedQuery: "Software Engineering React Node.js internships summer"
    },
    {
      name: "Undefined skills",
      profile: { major: "Mathematics" },
      expectedQuery: "software engineering tech internships summer"
    },
    {
      name: "Empty profile",
      profile: {},
      expectedQuery: "software engineering tech internships summer"
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
      expectedQuery: "CS 123 internships summer"
    },
    {
      name: "Null profile",
      profile: null,
      expectedQuery: "software engineering tech internships summer"
    }
  ];

  let passed = 0;
  for (const tc of testCases) {
    console.log("Testing: " + tc.name);
    try {
      const resultQuery = testFn(tc.profile);
      if (resultQuery === tc.expectedQuery) {
        console.log("  ✅ Passed. Query matched: " + resultQuery);
        passed++;
      } else {
        console.log("  ❌ Failed. Expected query: " + tc.expectedQuery + ", but got: " + resultQuery);
      }
    } catch (e) {
      console.log("  ❌ Failed with exception: " + e);
    }
  }

  console.log("Summary: " + passed + "/" + testCases.length + " tests passed.");
  if (passed === testCases.length) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch(console.error);
