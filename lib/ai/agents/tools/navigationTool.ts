import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const navigateToPageTool = createTool({
  id: 'navigate_to_page',
  description: 'Use this tool when the user explicitly asks to open a specific page, dashboard, or calculator. Returns a structured navigation action.',
  inputSchema: z.object({
    route: z.enum([
      '/',
      '/dashboard',
      '/attendance',
      '/calculator',
      '/placement',
      '/backlog',
      '/settings',
      '/roadmap',
    ]).describe('The application route to navigate to.'),
  }),
  execute: async ({ route }) => {
    return {
      action: {
        type: 'navigate',
        route: route,
      }
    };
  },
});
