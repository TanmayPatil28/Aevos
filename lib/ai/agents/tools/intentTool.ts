import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const classifyIntentTool = createTool({
  id: 'classify_intent',
  description: 'Classify the user\'s input into a specific predefined intent category. Use this when the user\'s message is ambiguous and needs categorization to decide the next step.',
  inputSchema: z.object({
    intent: z.enum([
      'attendance_analysis',
      'placement_analysis',
      'academic_risk',
      'cgpa_calculation',
      'roadmap_generator',
      'timeline',
      'unknown'
    ]).describe('The classified intent category.'),
    confidence: z.number().min(0).max(1).describe('Confidence score between 0.0 and 1.0'),
  }),
  execute: async ({ intent, confidence }) => {
    return {
      intent,
      confidence,
    };
  },
});
