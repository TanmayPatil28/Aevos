"use server";

import { prisma } from "@/lib/prisma";

export async function joinWaitlist(email: string) {
  try {
    const existing = await prisma.waitlist.findUnique({
      where: { email },
    });

    if (existing) {
      return { success: false, error: "You are already on the waitlist!" };
    }

    await prisma.waitlist.create({
      data: { email },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to join waitlist:", error);
    return { success: false, error: "Failed to join waitlist. Please try again." };
  }
}

export async function getWaitlistCount() {
  try {
    const count = await prisma.waitlist.count();
    // Add a base hype number
    return { success: true, count: count + 142 };
  } catch (error) {
    console.error("Failed to fetch waitlist count:", error);
    return { success: false, count: 0 };
  }
}
