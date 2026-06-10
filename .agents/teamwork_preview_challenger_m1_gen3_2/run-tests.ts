import { matchInternshipsForProfile, getLastQuery, resetQuery } from "./matcher-mocked";
import assert from "node:assert";

async function runTests() {
  console.log("Running mock tests...");

  // 1. undefined profile
  resetQuery();
  await matchInternshipsForProfile(undefined);
  assert.strictEqual(getLastQuery(), "software engineering tech internships summer", "Failed undefined profile");

  // 2. empty profile
  resetQuery();
  await matchInternshipsForProfile({});
  assert.strictEqual(getLastQuery(), "software engineering tech internships summer", "Failed empty profile");

  // 3. programme and branch
  resetQuery();
  await matchInternshipsForProfile({
    academic: { programme: "B.Tech", branch: "Computer Science" }
  });
  assert.strictEqual(getLastQuery(), "Computer Science B.Tech internships summer", "Failed programme and branch");

  // 4. missing branch
  resetQuery();
  await matchInternshipsForProfile({
    academic: { programme: "B.Tech" }
  });
  assert.strictEqual(getLastQuery(), "B.Tech internships summer", "Failed missing branch");

  // 5. missing programme
  resetQuery();
  await matchInternshipsForProfile({
    academic: { branch: "Mechanical" }
  });
  assert.strictEqual(getLastQuery(), "Mechanical  internships summer", "Failed missing programme");

  // 6. major and skills
  resetQuery();
  await matchInternshipsForProfile({
    major: "Data Science",
    skills: ["Python", "SQL", "Machine Learning"]
  });
  assert.strictEqual(getLastQuery(), "Data Science Python SQL internships summer", "Failed major and skills");

  // 7. empty skills array
  resetQuery();
  await matchInternshipsForProfile({
    major: "Data Science",
    skills: []
  });
  assert.strictEqual(getLastQuery(), "Data Science  internships summer", "Failed empty skills array");

  console.log("All tests passed.");
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
