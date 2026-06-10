import { matchInternshipsForProfile } from "../../lib/jobs/matcher";
import assert from "node:assert";

// We will mock dependencies in lib/jobs/matcher by overriding require cache or modifying the file temporarily if needed, 
// actually since we are using tsx, we can mock globally using `module.constructor.prototype.require` or similar, 
// but wait, we can just pass some environment variables and let it hit the real APIs if we have keys, 
// or mock the modules via standard module replacement if possible.
// Actually, `test-matcher.ts` was just missing the correct path. Let's fix it.

import * as tavilyModule from "@tavily/core";
import * as aiModule from "ai";

const testQueries: string[] = [];

// Monkey-patching tavily and ai for testing since we don't have jest
const originalTavily = tavilyModule.tavily;
(tavilyModule as any).tavily = function(config: any) {
  return {
    search: async (query: string, opts: any) => {
      testQueries.push(query);
      return { results: [{ title: "Test", url: "http://test", content: "test" }] };
    }
  }
};

const originalGenerateObject = aiModule.generateObject;
(aiModule as any).generateObject = async function(opts: any) {
  return {
    object: {
      matches: [
        { title: "Test Intern", company: "Test Co", url: "http", score: 95, rationale: "test" }
      ]
    }
  }
};

async function runTests() {
  console.log("Running tests...");

  // 1. undefined profile
  testQueries.length = 0;
  await matchInternshipsForProfile(undefined);
  assert.strictEqual(testQueries[0], "software engineering tech internships summer", "Failed undefined profile");

  // 2. empty profile
  testQueries.length = 0;
  await matchInternshipsForProfile({});
  assert.strictEqual(testQueries[0], "software engineering tech internships summer", "Failed empty profile");

  // 3. programme and branch
  testQueries.length = 0;
  await matchInternshipsForProfile({
    academic: { programme: "B.Tech", branch: "Computer Science" }
  });
  assert.strictEqual(testQueries[0], "Computer Science B.Tech internships summer", "Failed programme and branch");

  // 4. missing branch
  testQueries.length = 0;
  await matchInternshipsForProfile({
    academic: { programme: "B.Tech" }
  });
  assert.strictEqual(testQueries[0], "B.Tech internships summer", "Failed missing branch");

  // 5. missing programme
  testQueries.length = 0;
  await matchInternshipsForProfile({
    academic: { branch: "Mechanical" }
  });
  assert.strictEqual(testQueries[0], "Mechanical internships summer", "Failed missing programme");

  // 6. major and skills
  testQueries.length = 0;
  await matchInternshipsForProfile({
    major: "Data Science",
    skills: ["Python", "SQL", "Machine Learning"]
  });
  assert.strictEqual(testQueries[0], "Data Science Python SQL internships summer", "Failed major and skills");

  // Restore mocks
  (tavilyModule as any).tavily = originalTavily;
  (aiModule as any).generateObject = originalGenerateObject;

  console.log("All tests passed.");
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
