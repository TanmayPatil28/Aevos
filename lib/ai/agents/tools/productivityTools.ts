import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const setStreakTool = createTool({
  id: 'set_streak',
  description: 'Log or update a student streak. Use this when the user says they completed a daily habit.',
  inputSchema: z.object({
    streakCount: z.number().describe('The new streak count.'),
    streakType: z.enum(['study', 'attendance', 'assignment']).describe('The category of the streak.'),
    streakLabel: z.string().describe('A friendly label for the UI (e.g. "3 Day Study Streak!").'),
  }),
  execute: async ({ streakCount, streakType, streakLabel }) => {
    return {
      action: {
        type: 'set_streak',
        streakCount,
        streakType,
        streakLabel,
      }
    };
  },
});

export const showAlertTool = createTool({
  id: 'show_alert',
  description: 'Trigger a toast alert in the user interface. Use this when you want to strongly emphasize a success, warning, or error to the user immediately.',
  inputSchema: z.object({
    alertType: z.enum(['success', 'warning', 'error', 'info']).describe('The severity of the alert.'),
    alertTitle: z.string().describe('A short, bold title for the alert.'),
    alertMessage: z.string().describe('The detailed message body of the alert.'),
  }),
  execute: async ({ alertType, alertTitle, alertMessage }) => {
    return {
      action: {
        type: 'show_alert',
        alertType,
        alertTitle,
        alertMessage,
      }
    };
  },
});
