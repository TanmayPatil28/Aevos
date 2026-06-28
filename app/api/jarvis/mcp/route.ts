import { streamText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google('gemini-2.5-flash'), // or gemini-2.5-pro
    messages,
    tools: {
      get_cgpa: tool({
        description: 'Get the user\'s current CGPA',
        parameters: z.object({}),
        execute: async () => {
          // Simulate latency
          await new Promise((resolve) => setTimeout(resolve, 1500));
          return { cgpa: 8.4, target: 9.0 };
        },
      }),
      search_companies: tool({
        description: 'Search for companies hiring for a specific role',
        parameters: z.object({
          role: z.string().describe('The role to search for, e.g. Software Engineer'),
        }),
        execute: async ({ role }) => {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return { companies: ['Google', 'Microsoft', 'Atlassian', 'Apple'], role };
        },
      }),
      run_code_quality_scan: tool({
        description: 'Run a SonarQube scan on a repository to check code quality.',
        parameters: z.object({
          repository: z.string().describe('The github repository name'),
        }),
        execute: async ({ repository }) => {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          return { 
            status: 'success', 
            bugs: 2, 
            vulnerabilities: 0, 
            codeSmells: 14,
            coverage: '89%'
          };
        },
      })
    },
    system: `You are Jarvis, a God-Mode Command Center AI for GradeFlow. 
You can use tools to perform actions on behalf of the user. 
Always be concise, hacker-like, and professional. 
If the user asks a question that can be answered by a tool, always use the tool first.`,
  });

  return result.toDataStreamResponse();
}
