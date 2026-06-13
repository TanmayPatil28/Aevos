import { matchInternships } from "./actions";
import InternshipsDashboard from "@/components/internships/InternshipsDashboard";
import { InternshipMatch } from "@/components/internships/InternshipLedgerRow";

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Job & Internship Matcher | GradeFlow',
  description: 'Find internships matching your academic profile.',
};

export default async function InternshipsPage() {
  const matches = await matchInternships();

  // Ensure matches conform to the new schema types
  const typedMatches: InternshipMatch[] = matches.map((m: any) => ({
    title: m.title || "Unknown Role",
    company: m.company || "Unknown Company",
    url: m.url || "#",
    score: m.score || 0,
    rationale: m.rationale || "No rationale provided.",
    requiredSkills: m.requiredSkills || []
  }));

  return <InternshipsDashboard matches={typedMatches} />;
}
