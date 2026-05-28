import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * GradeFlow Design System — Canonical Class Name Utility
 * Merges Tailwind classes with clsx conditional logic and tailwind-merge deduplication.
 * This is the SINGLE source of truth for className composition across the entire codebase.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
