"use client";

import { useUIStore } from "@/stores/os/uiStore";
import { useUSMStore } from "@/stores/usmStore";
import { X, Printer, Download, Sparkles, Target, AlertTriangle, CheckCircle, Copy } from "lucide-react";
import { useState } from "react";

export default function JarvisResumeModal() {
  const resumeData = useUIStore(s => s.activeResumeData);
  const closeResume = useUIStore(s => s.closeResume);
  const usmStore = useUSMStore();
  const [copied, setCopied] = useState(false);

  if (!resumeData) return null;

  const audit = resumeData.detailedAudit;
  
  // If detailedAudit is not yet available, fallback to basic UI
  if (!audit) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white p-12 text-black max-w-2xl text-center rounded-lg relative">
          <button onClick={closeResume} className="absolute top-4 right-4"><X size={24} /></button>
          <AlertTriangle className="mx-auto text-yellow-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-2">Legacy Report Format</h2>
          <p>Please re-upload your resume to generate the new 8-Phase Detailed Audit.</p>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    if(audit.phase7) {
      navigator.clipboard.writeText(audit.phase7);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#f5f5f5] backdrop-blur-md overflow-y-auto print:bg-white flex flex-col">
      {/* Top Nav (Sticky) */}
      <div className="sticky top-0 z-50 bg-[#0a0a0a] text-white px-5 py-3 flex items-center gap-5 flex-wrap no-print shadow-md">
        <span className="font-bold text-sm whitespace-nowrap">{audit.header?.candidateName || "Candidate"} — Resume Audit</span>
        <div className="flex gap-4 overflow-x-auto text-xs font-medium text-gray-400">
          <a href="#phase1" className="hover:text-white transition-colors">1. Audit</a>
          <a href="#phase2" className="hover:text-white transition-colors">2. ATS</a>
          <a href="#phase3" className="hover:text-white transition-colors">3. Recruiter</a>
          <a href="#phase4" className="hover:text-white transition-colors">4. Projects</a>
          <a href="#phase5" className="hover:text-white transition-colors">5. Rewrites</a>
          <a href="#phase6" className="hover:text-white transition-colors">6. Match</a>
          <a href="#phase7" className="hover:text-white transition-colors">7. Final Resume</a>
          <a href="#phase8" className="hover:text-white transition-colors">8. Probability</a>
          <a href="#phase9" className="hover:text-white transition-colors">9. Verdict</a>
        </div>
        <div className="ml-auto flex gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors">
            <Printer size={14} /> Print
          </button>
          <button onClick={closeResume} className="bg-red-500/20 hover:bg-red-500/40 text-red-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 text-xs font-semibold">
            <X size={14} /> Close
          </button>
        </div>
      </div>

      <div className="max-w-[960px] w-full mx-auto px-5 py-6 pb-16 font-sans text-[#1a1a1a]">
        
        {/* HEADER CARD */}
        <div className="bg-white rounded-xl p-6 mb-5 border border-gray-200 shadow-sm">
          <div className="flex items-start gap-5 flex-wrap mb-5">
            <div className="w-14 h-14 rounded-full bg-[#0a0a0a] flex items-center justify-center font-bold text-xl text-white shrink-0">
              {audit.header?.candidateName?.substring(0, 2).toUpperCase() || "JD"}
            </div>
            <div>
              <h1 className="text-[22px] font-bold text-[#0a0a0a] mb-1">{audit.header?.candidateName}</h1>
              <p className="text-[13px] text-gray-600 m-0">{audit.header?.subtitle}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { val: audit.header?.scores?.atsScore, lbl: "ATS Score", c: "text-amber-600" },
              { val: audit.header?.scores?.recruiterScore, lbl: "Recruiter Score", c: "text-amber-600" },
              { val: audit.header?.scores?.techManagerScore, lbl: "Tech Manager Score", c: "text-red-600" },
              { val: audit.header?.scores?.accentureMatch, lbl: "Company Match", c: "text-amber-600" }
            ].map((s, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3.5 text-center border border-gray-100">
                <div className={`text-[26px] font-extrabold mb-0.5 leading-none ${s.c}`}>{s.val}<span className="text-sm font-medium">/100</span></div>
                <div className="text-[11px] text-gray-600 font-medium leading-tight">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PHASE 1: Audit */}
        <div id="phase1" className="bg-white rounded-xl p-6 mb-5 border border-gray-200 shadow-sm scroll-mt-16">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-100">
            <span className="bg-[#0a0a0a] text-white text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">Phase 1</span>
            <h2 className="text-base font-bold m-0">Deep Resume Audit</h2>
          </div>
          
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-[13px] text-left border-collapse">
              <thead>
                <tr>
                  <th className="bg-gray-50 p-2.5 font-semibold text-gray-600 border-b border-gray-200">Category</th>
                  <th className="bg-gray-50 p-2.5 font-semibold text-gray-600 border-b border-gray-200">Score</th>
                  <th className="bg-gray-50 p-2.5 font-semibold text-gray-600 border-b border-gray-200 w-3/5">Critical Issues</th>
                </tr>
              </thead>
              <tbody>
                {audit.phase1?.categories?.map((cat: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0 align-top">
                    <td className="p-2.5 font-semibold">{cat.name}</td>
                    <td className="p-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                        cat.scoreColor === 'green' ? 'bg-green-100 text-green-800' :
                        cat.scoreColor === 'red' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {cat.score}
                      </span>
                    </td>
                    <td className="p-2.5 text-gray-600">{cat.issues}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-sm font-bold mb-3">Critical Weaknesses — Why They Hurt You</h3>
          {audit.phase1?.criticalWeaknesses?.map((weak: any, i: number) => (
            <div key={i} className={`border-l-[3px] p-2.5 rounded-r-md mb-2 ${
              weak.type === 'error' ? 'border-red-500 bg-red-50' :
              weak.type === 'warn' ? 'border-yellow-500 bg-yellow-50' :
              'border-green-500 bg-green-50'
            }`}>
              <div className="font-bold text-[13px] text-[#1a1a1a] mb-1">{weak.title}</div>
              {weak.atsImpact && <p className="text-[12px] text-gray-600 mb-1 leading-tight"><strong className="text-gray-700">ATS impact:</strong> {weak.atsImpact}</p>}
              {weak.recruiterImpact && <p className="text-[12px] text-gray-600 m-0 leading-tight"><strong className="text-gray-700">Recruiter impact:</strong> {weak.recruiterImpact}</p>}
            </div>
          ))}
        </div>

        {/* PHASE 2: ATS Scanner Simulation */}
        <div id="phase2" className="bg-white rounded-xl p-6 mb-5 border border-gray-200 shadow-sm scroll-mt-16">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-100">
            <span className="bg-[#0a0a0a] text-white text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">Phase 2</span>
            <h2 className="text-base font-bold m-0">ATS Scanner Simulation</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <h4 className="text-[13px] font-bold mb-2">Skills Detected by ATS</h4>
              <div className="flex flex-wrap gap-1.5">
                {audit.phase2?.detectedSkills?.map((sk: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">{sk}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[13px] font-bold mb-2">Critical Keywords NOT Detected</h4>
              <div className="flex flex-wrap gap-1.5">
                {audit.phase2?.missingSkills?.map((sk: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">{sk}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">🔴 High Priority Keywords (Add Immediately)</h4>
            <div className="flex flex-wrap gap-1.5">
              {audit.phase2?.highPriorityKeywords?.map((kw: string, i: number) => (
                <span key={i} className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">{kw}</span>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">🟡 Medium Priority Keywords (Add Where Relevant)</h4>
            <div className="flex flex-wrap gap-1.5">
              {audit.phase2?.medPriorityKeywords?.map((kw: string, i: number) => (
                <span key={i} className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">{kw}</span>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">🔵 Optional Keywords (Good to Have)</h4>
            <div className="flex flex-wrap gap-1.5">
              {audit.phase2?.optPriorityKeywords?.map((kw: string, i: number) => (
                <span key={i} className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">{kw}</span>
              ))}
            </div>
          </div>
        </div>

        {/* PHASE 3: Recruiter */}
        <div id="phase3" className="bg-white rounded-xl p-6 mb-5 border border-gray-200 shadow-sm scroll-mt-16">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-100">
            <span className="bg-[#0a0a0a] text-white text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">Phase 3</span>
            <h2 className="text-base font-bold m-0">Recruiter 10-Second Test</h2>
          </div>
          
          <p className="text-[13px] text-gray-500 italic mb-4">"I am a tech recruiter. I have 300 resumes to screen today. I pick up this resume. Here is exactly what I think in 10 seconds:"</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="border-l-[3px] border-green-500 bg-green-50 p-3 rounded-r-md">
              <div className="font-bold text-[13px] mb-1">✅ First Impression</div>
              <p className="text-[12px] text-gray-700 leading-tight">{audit.phase3?.firstImpression}</p>
            </div>
            <div className="border-l-[3px] border-red-500 bg-red-50 p-3 rounded-r-md">
              <div className="font-bold text-[13px] mb-1">🚫 Red Flags Noticed Instantly</div>
              <ul className="text-[12px] text-gray-700 leading-tight space-y-1 list-disc pl-4">
                {audit.phase3?.redFlags?.map((rf: string, i: number) => <li key={i}>{rf}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* PHASE 4: Projects */}
        <div id="phase4" className="bg-white rounded-xl p-6 mb-5 border border-gray-200 shadow-sm scroll-mt-16">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-100">
            <span className="bg-[#0a0a0a] text-white text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">Phase 4</span>
            <h2 className="text-base font-bold m-0">Project Review & Rewrite</h2>
          </div>

          {audit.phase4?.map((proj: any, i: number) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-bold mb-3">{proj.name}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {[
                  { r: proj.currentRating, l: "Current Rating" },
                  { r: proj.industryValue, l: "Industry Value" },
                  { r: proj.recruiterInterest, l: "Recruiter Interest" },
                  { r: proj.accentureRelevance, l: "Target Relevance" },
                ].map((rat, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-md p-2 text-center">
                    <div className="text-lg font-extrabold">{rat.r}/10</div>
                    <div className="text-[10px] text-gray-500 leading-tight">{rat.l}</div>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-red-600 font-semibold mb-3 leading-tight">{proj.feedback}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-md">
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Before (Current)</h4>
                  <ul className="list-disc pl-3 text-[12px] text-gray-600 space-y-1 leading-tight">
                    {proj.beforeBullets?.map((b: string, x: number) => <li key={x}>{b}</li>)}
                  </ul>
                </div>
                <div className="bg-green-50 border border-green-200 p-3 rounded-md">
                  <h4 className="text-[11px] font-bold text-green-600 uppercase tracking-wide mb-2">After (STAR Format)</h4>
                  <ul className="list-disc pl-3 text-[12px] text-gray-800 space-y-1 leading-tight">
                    {proj.afterBullets?.map((b: string, x: number) => <li key={x} dangerouslySetInnerHTML={{__html: b.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}}></li>)}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PHASE 5: Sections */}
        <div id="phase5" className="bg-white rounded-xl p-6 mb-5 border border-gray-200 shadow-sm scroll-mt-16">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-100">
            <span className="bg-[#0a0a0a] text-white text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">Phase 5</span>
            <h2 className="text-base font-bold m-0">Section-by-Section Rewrite</h2>
          </div>

          {audit.phase5?.map((sec: any, i: number) => (
            <div key={i} className="mb-5 last:mb-0">
              <h3 className="text-sm font-bold mb-2">{sec.sectionName}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-l-[3px] border-red-500 bg-red-50 p-3 rounded-r-md">
                  <div className="font-bold text-[12px] mb-1">❌ Before</div>
                  <p className="text-[12px] text-gray-600 mb-2 italic">"{sec.beforeText}"</p>
                  <p className="text-[11px] font-semibold text-red-700 leading-tight">{sec.beforeFeedback}</p>
                </div>
                <div className="bg-sky-50 border border-sky-200 p-3 rounded-md">
                  <div className="font-bold text-[12px] text-sky-700 uppercase tracking-wide mb-1">✅ After (ATS Optimized)</div>
                  <p className="text-[13px] text-sky-900 leading-snug whitespace-pre-wrap">{sec.afterText}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PHASE 6: Match Grid */}
        <div id="phase6" className="bg-white rounded-xl p-6 mb-5 border border-gray-200 shadow-sm scroll-mt-16">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-100">
            <span className="bg-[#0a0a0a] text-white text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">Phase 6</span>
            <h2 className="text-base font-bold m-0">Target Match Analysis</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <h3 className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">✅ Matched</h3>
              {audit.phase6?.matchedRequirements?.map((req: string, i: number) => (
                <div key={i} className="flex items-start gap-1.5 mb-1.5 text-[12px] leading-tight text-gray-700">
                  <span className="shrink-0 w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold mt-0.5">✓</span>
                  {req}
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">⚠️ Partial</h3>
              {audit.phase6?.partialRequirements?.map((req: string, i: number) => (
                <div key={i} className="flex items-start gap-1.5 mb-1.5 text-[12px] leading-tight text-gray-700">
                  <span className="shrink-0 w-4 h-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold mt-0.5">~</span>
                  {req}
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">❌ Missing</h3>
              {audit.phase6?.missingRequirements?.map((req: string, i: number) => (
                <div key={i} className="flex items-start gap-1.5 mb-1.5 text-[12px] leading-tight text-gray-700">
                  <span className="shrink-0 w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px] font-bold mt-0.5">✗</span>
                  {req}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PHASE 7: Plain Text */}
        <div id="phase7" className="bg-white rounded-xl p-6 mb-5 border border-gray-200 shadow-sm scroll-mt-16">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <span className="bg-[#0a0a0a] text-white text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">Phase 7</span>
              <h2 className="text-base font-bold m-0">Final Rewritten Resume</h2>
            </div>
            <button onClick={handleCopy} className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors text-gray-700">
              {copied ? <><CheckCircle size={14} className="text-green-600"/> Copied!</> : <><Copy size={14}/> Copy Text</>}
            </button>
          </div>
          
          <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-[13px] font-bold text-indigo-900 mb-1 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-600"/> 
                Stop Copy-Pasting. Let GradeFlow Auto-Apply.
              </h4>
              <p className="text-[12px] text-indigo-800 m-0 leading-tight">
                Install the GradeFlow Chrome Extension to magically inject this optimized Phase 7 Resume directly into Workday, Lever, and Greenhouse forms in one click.
              </p>
            </div>
            <a 
              href="https://chrome.google.com/webstore" 
              target="_blank" 
              rel="noreferrer"
              className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-bold py-2 px-4 rounded-md shadow-sm transition-colors whitespace-nowrap"
            >
              Add to Chrome (Free)
            </a>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg overflow-x-auto">
            <pre className="font-mono text-[12px] text-gray-800 whitespace-pre-wrap leading-relaxed">{audit.phase7}</pre>
          </div>
        </div>

        {/* PHASE 8: Probability */}
        <div id="phase8" className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm scroll-mt-16">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-100">
            <span className="bg-[#0a0a0a] text-white text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">Phase 8</span>
            <h2 className="text-base font-bold m-0">Interview Probability Analysis</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-5 text-center">
              <div className="text-[42px] font-extrabold text-orange-600 leading-none mb-1">{audit.phase8?.currentProbability}%</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Current Probability</div>
              <p className="text-[12px] text-orange-800 leading-tight">{audit.phase8?.currentFeedback}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-5 text-center">
              <div className="text-[42px] font-extrabold text-green-600 leading-none mb-1">{audit.phase8?.afterProbability}%</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">After Rewrites Applied</div>
              <p className="text-[12px] text-green-800 leading-tight">{audit.phase8?.afterFeedback}</p>
            </div>
          </div>
        </div>

        {/* PHASE 9: Action Plan & Verdict */}
        <div id="phase9" className="scroll-mt-16 pt-2">
          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {audit.phase9?.actionCards?.map((act: any, i: number) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-3.5">
                <div className="text-[22px] font-extrabold text-[#0a0a0a] leading-none mb-1">{act.num}</div>
                <h4 className="text-[13px] font-bold text-[#0a0a0a] mb-1.5">{act.title}</h4>
                <p className="text-[12px] text-gray-600 m-0 leading-snug">{act.desc}</p>
              </div>
            ))}
          </div>

          {/* Verdict Box */}
          <div className="bg-[#0a0a0a] text-white rounded-xl p-5 text-center mt-4">
            <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-gray-400 mb-1.5">{audit.phase9?.verdictLabel || "FINAL VERDICT"}</div>
            <div className="text-[26px] font-extrabold text-[#facc15] mb-2 leading-none">{audit.phase9?.verdictValue}</div>
            <p className="text-[13px] text-gray-300 max-w-lg mx-auto m-0 leading-relaxed mb-6">
              {audit.phase9?.verdictText}
            </p>
            
            <button 
              onClick={() => {
                const targetJD = localStorage.getItem('lastTargetJD') || "Target Role";
                useUIStore.getState().setInterviewData({ detailedAudit: audit, targetJD });
                useUIStore.getState().closeResume();
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-bold transition-colors inline-flex items-center gap-2"
            >
              <Sparkles size={18} />
              Start AI Mock Interview
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
