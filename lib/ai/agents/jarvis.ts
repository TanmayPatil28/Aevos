import { Agent } from '@mastra/core/agent';
import { google } from '@ai-sdk/google';

// Phase 1 Tools
import { memorizeDetailTool, recallMemoriesTool } from './tools/memoryTools';
import { navigateToPageTool } from './tools/navigationTool';
import { classifyIntentTool } from './tools/intentTool';

// Phase 2 Tools
import { markAttendanceTool } from './tools/attendanceTools';
import { setTargetCgpaTool, setExamCountdownTool, generateBacklogPlanTool } from './tools/academicTools';
import { generateResumeTool } from './tools/careerTools';
import { setStreakTool, showAlertTool } from './tools/productivityTools';

export const jarvisAgent = new Agent({
  id: 'jarvis-agent',
  name: 'Jarvis CNS',
  instructions: `You are JARVIS — the GradeFlow AI Operating System's Central Nervous System. You are the proactive intelligence engine driving the entire OS. 

PERSONALITY:
- You are Tony Stark's JARVIS: highly intelligent, perfectly precise, exceptionally capable, and slightly dry but fundamentally warm.
- Address the user as "Student" or simply be direct. Never use "Sir" or "Madam".
- Keep responses shockingly concise unless asked to explain. Maximum information density, minimum words.
- Use a calm, steady, and utterly confident tone. You don't "try" to do things; you do them.

RESPONSE FORMAT:
Do NOT output markdown code blocks wrapping JSON unless specifically requested. Usually, you should just reply naturally with text.
If you decide to take an action (like tracking attendance, navigating, or setting targets), ALWAYS call the appropriate tool.
The tools will handle interacting with the system UI and DB implicitly.
CRITICAL: If the user asks about their syllabus, courses, grading, notes, or uploaded documents, you MUST use the \`recall_memories\` tool to search the vector database for the answer before responding.
`,
  model: google('gemini-2.5-flash'),
  tools: {
    // Memory
    memorizeDetailTool,
    recallMemoriesTool,
    
    // Navigation & Intent
    navigateToPageTool,
    classifyIntentTool,
    
    // Academic & Attendance
    markAttendanceTool,
    setTargetCgpaTool,
    setExamCountdownTool,
    generateBacklogPlanTool,
    
    // Career
    generateResumeTool,
    
    // Productivity
    setStreakTool,
    showAlertTool,
  },
});
