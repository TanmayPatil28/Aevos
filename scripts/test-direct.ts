import { NextRequest } from "next/server";
import { POST as skillGapPost } from "./app/api/career/skill-gap/route";
import { POST as parseResumePost } from "./app/api/parse/resume/route";

async function run() {
  try {
    const req = new NextRequest("http://localhost:3000/api/career/skill-gap", {
      method: "POST",
      body: JSON.stringify({ userSkills: ["React"], targetRole: "Frontend Developer" })
    });
    const res = await skillGapPost(req);
    console.log("Skill Gap Response Status:", res.status);
    console.log(await res.json());
  } catch(e) {
    console.error("Error running skill gap:", e);
  }
}
run();
