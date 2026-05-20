import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const calculationSchema = z.object({
  semester: z.string().trim().min(1, "Semester is required"),
  sgpa: z.coerce.number().min(0, "SGPA must be a non-negative number"),
  cgpa: z.coerce.number().min(0, "CGPA must be a non-negative number").optional().default(0),
  total_credits: z.coerce.number().int().min(0, "Total credits must be a non-negative integer"),
  subjects: z.array(z.record(z.string(), z.any())).min(1, "Subjects/semesters array cannot be empty"),
});

export const planSchema = z.object({
  current_cgpa: z.coerce.number().min(0, "Current CGPA must be a non-negative number"),
  target_cgpa: z.coerce.number().min(0, "Target CGPA must be a non-negative number"),
  completed_semesters: z.coerce.number().int().min(0, "Completed semesters must be a non-negative integer"),
  remaining_semesters: z.coerce.number().int().min(0, "Remaining semesters must be a non-negative integer"),
  required_gpa: z.coerce.number().min(0, "Required GPA must be a non-negative number"),
  plan_data: z.array(z.record(z.string(), z.any())).min(1, "Plan data cannot be empty"),
});
