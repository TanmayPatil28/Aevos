import { matchInternshipsForProfile } from "./lib/jobs/matcher";
async function main() {
  const profile = {
    major: "Computer Science",
    skills: "React, Node, Python"
  };
  try {
    const res = await matchInternshipsForProfile(profile);
    console.log("Success:", res);
  } catch (e) {
    console.error("Crash:", e);
  }
}
main();
