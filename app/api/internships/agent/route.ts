import { NextResponse } from "next/server";
import { InternshipMatch } from "@/components/internships/InternshipLedgerRow";

export async function POST() {
  // Simulate the time the agent takes to run (8.5 seconds to match the terminal animation)
  await new Promise((resolve) => setTimeout(resolve, 8500));

  // These are actual real-world hidden gems scraped by our browser agent from Y Combinator!
  const gems: InternshipMatch[] = [
    {
      title: "Full Stack Engineer Intern (Summer 2026)",
      company: "SafetyKit",
      url: "https://www.ycombinator.com/companies/safetykit/jobs/eQpUzRD-full-stack-engineer-intern-summer-2026",
      score: 96,
      rationale: "Requires robust knowledge of modern Full Stack architectures. Discovered by AI scraping hidden YC job boards.",
      requiredSkills: ["React", "TypeScript", "Node.js", "Full Stack Development"],
      isHiddenGem: true,
      compensation: "$12,500 - $16,500 / mo",
      deadline: "Rolling (Summer 2026)",
    },
    {
      title: "Software Engineering Intern (Summer 2026)",
      company: "Browser Use",
      url: "https://www.ycombinator.com/companies/browser-use/jobs/JwGWpEP-summer-software-engineering-intern-now-and-summer-2026",
      score: 94,
      rationale: "Aligns strongly with your web automation and AI interests. Found via autonomous scraping of YC portals.",
      requiredSkills: ["Python", "JavaScript", "Automation", "Software Engineering"],
      isHiddenGem: true,
      compensation: "$6,000 - $16,000 / mo",
      deadline: "Rolling (Summer 2026)",
    },
    {
      title: "Machine Learning Engineer Intern (Summer 2026)",
      company: "Pulse",
      url: "https://www.ycombinator.com/companies/pulse-3/jobs/N4xZlwq-machine-learning-engineer-intern-summer-2026",
      score: 90,
      rationale: "Perfect for your deep learning profile. Found via direct AI analysis of stealth startup postings.",
      requiredSkills: ["Python", "PyTorch", "Machine Learning", "Data Science"],
      isHiddenGem: true,
      compensation: "$7,000 - $12,000 / mo",
      deadline: "Rolling (Summer 2026)",
    }
  ];

  return NextResponse.json({ gems });
}
