/**
 * GradeFlow OS - Product Language Dictionary
 * 
 * BANNED TERMINOLOGY:
 * ❌ Parse, Extraction, Ingestion, OCR (Too technical)
 * ❌ Mutation, Combinatorial, Matrix (Too robotic)
 * ❌ Warning, Failure, Critical Error (Too dramatic/stressful)
 * ❌ Dashboard, Mission Control, Terminal (Too pseudo-enterprise)
 */

export const COPY = {
  // Global
  APP_NAME: "GradeFlow",
  WORKSPACE_NAME: "Academic Workspace",
  
  // Overview
  OVERVIEW: {
    GREETING: "Good morning.",
    STATUS_ON_TRACK: "and you are currently on track.",
    STATUS_SETUP: "Let's set up your academic workspace.",
    MOMENTUM_LABEL: "MOMENTUM",
    CONTINUE_LABEL: "CONTINUE",
    ALERT_HEADER: "Attention needed",
  },

  // Records
  RECORDS: {
    TITLE: "Import Your Records",
    SUBTITLE: "Upload your official university result PDFs to automatically organize your grades.",
    UPLOAD_PROMPT: "Upload Result PDF",
    SUCCESS_TITLE: "Semester Imported Successfully",
    SUCCESS_CTA: "Review in Ledger",
  },

  // Ledger
  LEDGER: {
    TITLE: "Ledger",
    EMPTY_STATE_TITLE: "Your ledger is empty.",
    EMPTY_STATE_SUB: "Import your official records to build your academic timeline.",
    ACTION_IMPORT: "Import Official Records",
    ACTION_MANUAL: "Setup Manually",
    CONTINUITY_PROMPT: "Grades saved. View your new trajectory in Forecasting \u2192", // right arrow
  },

  // Forecasting
  FORECASTING: {
    TITLE: "Let's plan your next move.",
    SUBTITLE: "Explore what's possible next semester. Adjust your goals below.",
    TARGET_PROMPT: "I want my CGPA to reach:",
    FEEDBACK_IMPOSSIBLE_TITLE: "That's mathematically out of reach for just one semester.",
    FEEDBACK_IMPOSSIBLE_SUB: "Try lowering your target or planning over two semesters instead.",
    FEEDBACK_ACHIEVED_TITLE: "You've already surpassed this!",
    FEEDBACK_ACHIEVED_SUB: "Aim a little higher to see what it takes to grow.",
    TRAJECTORY_LABEL: "YOUR TRAJECTORY",
  }
} as const;
