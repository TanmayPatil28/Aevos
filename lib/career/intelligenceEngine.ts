// Removed unused import

export interface CompanyCriteria {
  name: string;
  cgpaCutoff: number;
  maxBacklogs: number;
  requiredCredits: number;
  requiredSkills?: string[];
  details?: string;
  tier: "Product" | "Service" | "Startup" | "FAANG";
}

export interface IntelligenceResult {
  name: string;
  eligibilityScore: number; // 0 to 100
  status: "ELIGIBLE" | "BORDERLINE" | "INELIGIBLE";
  breakdown: {
    factor: string;
    status: "Strong" | "Moderate" | "Weak" | "Risk";
    message: string;
    gap?: string;
  }[];
  tier: "Product" | "Service" | "Startup" | "FAANG";
}

export interface SkillGapResult {
  role: string;
  missingSkills: string[];
  presentSkills: string[];
  readinessPercentage: number;
}

export interface IntelligenceEngineInput {
  cgpa: number;
  backlogs: number;
  earnedCredits: number;
  branch: string;
  skills: string[];
  targetRole: string;
  customCriteria?: CompanyCriteria[];
}

import { ROLE_SKILL_MAP, DEFAULT_RECRUITERS } from "./careerData";

export const intelligenceEngine = {
  calculateEligibility(input: IntelligenceEngineInput): IntelligenceResult[] {
    const { cgpa, backlogs, earnedCredits, skills, customCriteria } = input;
    const criteriaList = customCriteria || DEFAULT_RECRUITERS;
    
    // Normalize user skills for easy matching
    const userSkills = skills.map(s => s.toLowerCase());

    return criteriaList.map((company) => {
      let score = 100;
      const breakdown: IntelligenceResult["breakdown"] = [];

      // Robust CGPA Scaling Check
      // A high CGPA should provide buffer for other weaknesses.
      if (cgpa >= company.cgpaCutoff + 1.5) {
        breakdown.push({ factor: "CGPA", status: "Strong", message: `Exceptional (${cgpa}), provides strong buffer` });
        score += 10; // Bonus
      } else if (cgpa >= company.cgpaCutoff + 0.5) {
        breakdown.push({ factor: "CGPA", status: "Strong", message: `Comfortably above ${company.cgpaCutoff} cutoff` });
      } else if (cgpa >= company.cgpaCutoff) {
        breakdown.push({ factor: "CGPA", status: "Moderate", message: `Meets ${company.cgpaCutoff} cutoff` });
        score -= 5;
      } else {
        const gapVal = (company.cgpaCutoff - cgpa).toFixed(2);
        const gapPenalty = Math.min(50, parseFloat(gapVal) * 30); // E.g., 0.5 gap = 15 penalty
        breakdown.push({ factor: "CGPA", status: "Weak", message: `Below ${company.cgpaCutoff} cutoff`, gap: `+${gapVal} CGPA Required` });
        score -= (30 + gapPenalty);
      }

      // Robust Backlogs Penalty Check
      // Exponential penalty to harshly punish multiple backlogs
      if (backlogs === 0) {
        breakdown.push({ factor: "Backlogs", status: "Strong", message: "Clear standing" });
      } else if (backlogs <= company.maxBacklogs) {
        breakdown.push({ factor: "Backlogs", status: "Moderate", message: `Within limit of ${company.maxBacklogs}` });
        score -= (backlogs * 5); // Minor penalty per backlog even if allowed
      } else {
        const excess = backlogs - company.maxBacklogs;
        const backlogPenalty = 30 + Math.pow(excess, 2) * 10; // 1 excess = 40, 2 excess = 70
        breakdown.push({ factor: "Backlogs", status: "Risk", message: `Exceeds max allowed (${company.maxBacklogs})`, gap: `Clear ${excess} Backlog(s)` });
        score -= backlogPenalty;
      }

      // Semantic / Partial Skills Match
      if (company.requiredSkills && company.requiredSkills.length > 0) {
        const checkSkillMatch = (req: string) => {
          const reqLower = req.toLowerCase();
          for (const u of userSkills) {
            if (u === reqLower || u.includes(reqLower) || reqLower.includes(u)) return 1.0;
            // Partial equivalence mapping (manual fallback)
            if ((reqLower === "react" && u === "nextjs") || (reqLower === "next.js" && u === "react")) return 0.5;
            if ((reqLower === "node" && u === "express") || (reqLower === "express" && u === "node")) return 0.5;
            if ((reqLower === "aws" && u === "gcp") || (reqLower === "azure" && u === "aws")) return 0.3;
          }
          return 0;
        };

        let totalSkillScore = 0;
        const missingSkillsList: string[] = [];

        company.requiredSkills.forEach(req => {
          const matchVal = checkSkillMatch(req);
          totalSkillScore += matchVal;
          if (matchVal < 1.0) missingSkillsList.push(req);
        });

        const skillMatchRatio = totalSkillScore / company.requiredSkills.length;
        
        if (skillMatchRatio === 1) {
          breakdown.push({ factor: "Skills", status: "Strong", message: "Matches all required skills perfectly" });
        } else if (skillMatchRatio >= 0.7) {
          breakdown.push({ factor: "Skills", status: "Moderate", message: `Strong match (${Math.round(skillMatchRatio * 100)}%)`, gap: missingSkillsList.length > 0 ? `Refine: ${missingSkillsList.join(", ")}` : undefined });
          score -= 5;
        } else if (skillMatchRatio >= 0.4) {
          breakdown.push({ factor: "Skills", status: "Moderate", message: `Partial match (${Math.round(skillMatchRatio * 100)}%)`, gap: `Acquire: ${missingSkillsList.slice(0, 3).join(", ")}` });
          score -= 15;
        } else {
          breakdown.push({ factor: "Skills", status: "Weak", message: `Missing most required skills`, gap: `Acquire: ${missingSkillsList.slice(0, 3).join(", ")}` });
          score -= 30;
        }
      }

      // Credits Check
      if (earnedCredits < company.requiredCredits) {
         const creditGap = company.requiredCredits - earnedCredits;
         score -= Math.min(30, creditGap * 2);
         breakdown.push({ factor: "Credits", status: "Weak", message: `Need ${creditGap} more credits` });
      }

      score = Math.max(0, Math.min(100, score));
      
      let status: IntelligenceResult["status"] = "ELIGIBLE";
      if (score < 50) status = "INELIGIBLE";
      else if (score < 80) status = "BORDERLINE";

      return {
        name: company.name,
        eligibilityScore: score,
        status,
        breakdown,
        tier: company.tier
      };
    });
  },

  calculatePlacementRisk(input: IntelligenceEngineInput) {
    const results = this.calculateEligibility(input);
    const avgScore = results.reduce((acc, curr) => acc + curr.eligibilityScore, 0) / results.length;
    
    let readinessScore = "SAFE";
    if (avgScore < 40 || input.backlogs > 2) readinessScore = "CRITICAL";
    else if (avgScore < 60) readinessScore = "HIGH RISK";
    else if (avgScore < 80) readinessScore = "MODERATE RISK";

    return {
      readinessScore,
      averageEligibility: avgScore,
      serviceCompanyReadiness: results.filter(r => DEFAULT_RECRUITERS.find(c => c.name === r.name)?.tier === "Service").reduce((acc, curr) => acc + curr.eligibilityScore, 0) / 4 || 0,
      productCompanyReadiness: results.filter(r => ["Product", "FAANG"].includes(DEFAULT_RECRUITERS.find(c => c.name === r.name)?.tier || "")).reduce((acc, curr) => acc + curr.eligibilityScore, 0) / 3 || 0,
    };
  },

  detectSkillGaps(userSkills: string[], targetRole: string): SkillGapResult {
    const roleMap = ROLE_SKILL_MAP[targetRole] || ROLE_SKILL_MAP["Frontend Developer"];
    const allRequired = Object.values(roleMap).flat();
    
    const normalizedUser = userSkills.map(s => s.toLowerCase().trim());
    
    const presentSkills = allRequired.filter(req => normalizedUser.some(u => req.toLowerCase().includes(u) || u.includes(req.toLowerCase())));
    const missingSkills = allRequired.filter(req => !presentSkills.includes(req));
    
    const readinessPercentage = Math.round((presentSkills.length / allRequired.length) * 100) || 0;

    return {
      role: targetRole,
      missingSkills,
      presentSkills,
      readinessPercentage
    };
  },

  async analyzeSkillGapAI(userSkills: string[], targetRole: string): Promise<SkillGapResult> {
    try {
      const res = await fetch('/api/career/skill-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userSkills, targetRole })
      });
      if (!res.ok) throw new Error("Failed to fetch AI skill gap");
      return res.json();
    } catch (e) {
      console.error(e);
      // Fallback to local synchronous detection
      return this.detectSkillGaps(userSkills, targetRole);
    }
  },

  generateTimeline(completedSemesters: number) {
    const timeline = [
      { sem: 1, title: "Exploration", tasks: ["Maintain 8.0+ CGPA", "Learn C/C++ Basics"] },
      { sem: 2, title: "Foundation", tasks: ["Learn OOP", "Start Web Dev Basics"] },
      { sem: 3, title: "Core Skills", tasks: ["Learn Git + GitHub", "Build 1 Frontend Project", "Start LinkedIn"] },
      { sem: 4, title: "DSA & Hackathons", tasks: ["Learn DSA basics", "Participate in hackathons", "Build Backend Project"] },
      { sem: 5, title: "Internship Prep", tasks: ["Resume optimization", "Apply for internships", "Advanced DSA"] },
      { sem: 6, title: "Placement Prep", tasks: ["Aptitude Training", "Mock Interviews", "Core CS Subjects (OS, DBMS)"] },
      { sem: 7, title: "Placement Drive", tasks: ["Company Specific Prep", "Final Year Project"] },
      { sem: 8, title: "Transition", tasks: ["Industry Readiness", "Onboarding Prep"] }
    ];

    // Identify current and future steps
    return timeline.map(t => ({
      ...t,
      status: t.sem <= completedSemesters ? "COMPLETED" : (t.sem === completedSemesters + 1 ? "CURRENT" : "FUTURE")
    }));
  }
};
