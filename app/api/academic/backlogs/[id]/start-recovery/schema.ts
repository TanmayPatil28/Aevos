import { z } from "zod";

export const startRecoveryPayloadSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  failReason: z.string().min(1, "Failure reason is required"),
  calendarContext: z.string().min(1, "Calendar context is required"),
  timetableLoad: z.string().min(1, "Timetable load is required"),
  retryDays: z.number().int().nonnegative("Retry days must be a non-negative integer"),
});
