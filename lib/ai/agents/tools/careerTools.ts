import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const generateResumeTool = createTool({
  id: 'generate_resume',
  description: 'Generate a tailored resume payload for a specific company. Use this when the user says "build my Google resume" or "generate a resume". You must use their actual skills and grades to craft the content.',
  inputSchema: z.object({
    company: z.string().describe('The name of the target company.'),
    summary: z.string().describe('A professional summary paragraph tailored to the company, highlighting the student\'s grades, academic health, and best skills.'),
    skills: z.array(z.string()).describe('An array of the student\'s highly relevant skills mapped from their career context.'),
    coursework: z.array(z.string()).describe('An array of passed courses highly relevant to the company.'),
  }),
  execute: async ({ company, summary, skills, coursework }) => {
    return {
      action: {
        type: 'generate_resume',
        resumeData: {
          company,
          summary,
          skills,
          coursework,
        }
      }
    };
  },
});
