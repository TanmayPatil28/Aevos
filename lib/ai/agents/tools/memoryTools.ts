import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { memorizeUserDetail, retrieveMemories } from '@/lib/ai/memory';

export const memorizeDetailTool = createTool({
  id: 'memorize_detail',
  description: 'Memorize an important fact about the user for long-term recall. Call this tool when the user tells you something important about themselves that you should remember permanently (e.g., goals, study habits, target companies, specific struggles).',
  inputSchema: z.object({
    content: z.string().describe('A concise sentence describing what you should remember about the user.'),
  }),
  execute: async ({ content }) => {
    const success = await memorizeUserDetail(content);
    return { success, message: success ? 'Memorized successfully' : 'Failed to memorize' };
  },
});

export const recallMemoriesTool = createTool({
  id: 'recall_memories',
  description: 'Search the vector database for relevant memories, uploaded documents, syllabus, and notes about the user based on a query. ALWAYS use this if the user asks about course details or their uploaded files.',
  inputSchema: z.object({
    query: z.string().describe('The search query to find relevant memories.'),
  }),
  execute: async ({ query }) => {
    const memories = await retrieveMemories(query, 3, 0.5);
    return { memories: memories.map(m => m.content) };
  },
});
