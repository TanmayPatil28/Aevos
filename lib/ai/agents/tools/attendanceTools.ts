import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const markAttendanceTool = createTool({
  id: 'mark_attendance',
  description: 'Mark attendance for a specific course as either ATTENDED or BUNKED. Use this when the user says something like "mark DBMS as bunked" or "I attended Math today".',
  inputSchema: z.object({
    courseId: z.string().describe('The exact id or code of the course from the student context.'),
    attendanceAction: z.enum(['ATTENDED', 'BUNKED']).describe('Whether the student attended or bunked.'),
  }),
  execute: async ({ courseId, attendanceAction }) => {
    // This structured action is returned to the frontend UI to mutate the local Zustand store
    return {
      action: {
        type: 'mark_attendance',
        courseId,
        attendanceAction,
      }
    };
  },
});
