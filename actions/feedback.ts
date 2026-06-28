"use server";

import { prisma } from "@/lib/prisma";

export async function submitFeedback(rating: number, message: string) {
  try {
    const feedback = await prisma.feedback.create({
      data: {
        rating,
        message,
      },
    });
    return { success: true, id: feedback.id };
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    return { success: false, error: "Failed to submit feedback" };
  }
}
