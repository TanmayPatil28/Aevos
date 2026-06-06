import { DecisionNode } from "./decisionTypes";

// MVP Seed Data
export const initialDecisionNodes: Record<string, DecisionNode> = {
  "start": {
    id: "start",
    title: "Current Semester",
    description: "You are at a crossroads. How will you allocate your time?",
    category: "life",
    impact: { gpaDelta: 0, skillDelta: 0, careerDelta: 0, stressDelta: 0, narrative: "Started the semester." },
    nextOptions: ["focus_academics", "focus_skills", "balanced"]
  },
  
  // Branch 1: Academic Focus
  "focus_academics": {
    id: "focus_academics",
    title: "Maximum Academic Focus",
    description: "Attend all lectures, prioritize assignments over side projects.",
    category: "academic",
    impact: { 
      gpaDelta: 0.5, 
      skillDelta: 5, 
      careerDelta: 5, 
      stressDelta: 20, 
      narrative: "You achieved a high GPA, but didn't build many external skills." 
    },
    nextOptions: ["academic_research", "burnout_break"]
  },
  "academic_research": {
    id: "academic_research",
    title: "Publish a Paper",
    description: "Work with a professor on research.",
    category: "academic",
    impact: { 
      gpaDelta: 0.2, 
      skillDelta: 15, 
      careerDelta: 25, 
      stressDelta: 15, 
      narrative: "Your research was published! Great for grad school or specialized roles." 
    },
    nextOptions: ["grad_school_prep"]
  },
  "burnout_break": {
    id: "burnout_break",
    title: "Take a Breather",
    description: "You pushed too hard last semester. Time to relax.",
    category: "life",
    impact: { 
      gpaDelta: -0.3, 
      skillDelta: 0, 
      careerDelta: 0, 
      stressDelta: -40, 
      narrative: "You recovered your energy, but your grades slipped slightly." 
    },
    nextOptions: ["balanced"]
  },

  // Branch 2: Skill Focus
  "focus_skills": {
    id: "focus_skills",
    title: "Grind LeetCode & Projects",
    description: "Skip some lectures to build full-stack projects and prep for interviews.",
    category: "career",
    impact: { 
      gpaDelta: -0.4, 
      skillDelta: 40, 
      careerDelta: 35, 
      stressDelta: 10, 
      narrative: "Your skills skyrocketed, but skipping class hurt your grades." 
    },
    nextOptions: ["startup_internship", "faang_prep"]
  },
  "startup_internship": {
    id: "startup_internship",
    title: "Join Early Stage Startup",
    description: "Work part-time while studying.",
    category: "career",
    impact: { 
      gpaDelta: -0.6, 
      skillDelta: 50, 
      careerDelta: 45, 
      stressDelta: 30, 
      narrative: "Incredible real-world experience, but academics took a major hit." 
    },
    nextOptions: ["full_time_offer"]
  },
  "faang_prep": {
    id: "faang_prep",
    title: "Hardcore Interview Prep",
    description: "Focus purely on competitive programming.",
    category: "career",
    impact: { 
      gpaDelta: -0.2, 
      skillDelta: 20, 
      careerDelta: 50, 
      stressDelta: 25, 
      narrative: "You are highly competitive for top tech companies now." 
    },
    nextOptions: ["faang_interview"]
  },

  // Branch 3: Balanced
  "balanced": {
    id: "balanced",
    title: "Balanced Approach",
    description: "Maintain decent grades while doing 1 side project.",
    category: "life",
    impact: { 
      gpaDelta: 0.1, 
      skillDelta: 15, 
      careerDelta: 15, 
      stressDelta: 0, 
      narrative: "A solid, low-risk semester. Steady progress across the board." 
    },
    nextOptions: ["focus_academics", "focus_skills", "ai_auto_apply"]
  },

  // Premium Node (Locked)
  "ai_auto_apply": {
    id: "ai_auto_apply",
    title: "GradeFlow AI Auto-Apply",
    description: "Use GradeFlow's AI to auto-generate cover letters and apply to 100 FAANG roles overnight.",
    category: "career",
    isPremium: true,
    impact: { 
      gpaDelta: 0, 
      skillDelta: 10, 
      careerDelta: 150, 
      stressDelta: -50, 
      narrative: "GradeFlow AI handled your entire recruiting cycle. You woke up to 3 interview requests." 
    },
    nextOptions: ["faang_interview"]
  },

  // End States (Simulated)
  "grad_school_prep": {
    id: "grad_school_prep",
    title: "Apply for Masters",
    description: "Focus on GRE and SOP.",
    category: "academic",
    impact: { gpaDelta: 0.1, skillDelta: 10, careerDelta: 10, stressDelta: 15, narrative: "You are ready for higher studies." },
    nextOptions: []
  },
  "full_time_offer": {
    id: "full_time_offer",
    title: "Accept Return Offer",
    description: "Secure a job before graduation.",
    category: "career",
    impact: { gpaDelta: -0.5, skillDelta: 10, careerDelta: 80, stressDelta: -20, narrative: "Job secured! Academic performance no longer matters." },
    nextOptions: []
  },
  "faang_interview": {
    id: "faang_interview",
    title: "FAANG Onsite",
    description: "Fly out for final rounds.",
    category: "career",
    impact: { gpaDelta: -0.2, skillDelta: 5, careerDelta: 60, stressDelta: 40, narrative: "You cracked the interview!" },
    nextOptions: []
  }
};
