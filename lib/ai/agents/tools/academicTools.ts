import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const setTargetCgpaTool = createTool({
  id: 'set_target_cgpa',
  description: 'Use this tool when the user states they want to set a target or goal CGPA. Returns a structured action for the UI to execute.',
  inputSchema: z.object({
    value: z.number().describe("The target CGPA value (e.g., 8.5)")
  }),
  execute: async ({ value }) => {
    return {
      action: {
        type: 'set_target_cgpa',
        value
      }
    };
  }
});

export const setExamCountdownTool = createTool({
  id: 'set_exam_countdown',
  description: 'Set a countdown for an upcoming exam.',
  inputSchema: z.object({
    courseId: z.string(),
    date: z.string()
  }),
  execute: async ({ courseId, date }) => {
    return { action: { type: 'set_exam_countdown', courseId, date } };
  }
});

export const generateBacklogPlanTool = createTool({
  id: 'generate_backlog_plan',
  description: 'Generate a plan to clear backlogs.',
  inputSchema: z.object({}),
  execute: async () => {
    return { action: { type: 'generate_backlog_plan' } };
  }
});
