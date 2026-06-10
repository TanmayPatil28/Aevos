import { matchInternships } from "./actions";

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Job & Internship Matcher | GradeFlow',
  description: 'Find internships matching your academic profile.',
};

export default async function InternshipsPage() {
  const matches = await matchInternships();

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Job & Internship Matcher</h1>
        <p className="text-muted-foreground">
          We analyzed your academic profile and found the following internship opportunities that match your coursework and skills.
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-card">
          <p className="text-muted-foreground text-lg">No internships matched your profile at this time. Check back later!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {matches.map((match, i) => (
            <div key={i} className="p-6 border rounded-xl bg-card shadow-sm flex flex-col space-y-4 transition-all hover:shadow-md">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <h2 className="text-xl font-semibold leading-tight mb-1">
                    <a 
                      href={match.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:underline text-primary"
                    >
                      {match.title}
                    </a>
                  </h2>
                  <p className="text-muted-foreground font-medium flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-building-2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
                    {match.company}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap mr-1"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
                    {match.score}% Match
                  </div>
                </div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold mb-1 text-foreground">Why it&apos;s a match</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {match.rationale}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
