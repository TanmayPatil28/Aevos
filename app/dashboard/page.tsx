import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Calculation, Plan } from "@prisma/client";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  let rawCalculations: Calculation[] = [];
  let rawPlans: Plan[] = [];
  let dbError = false;

  try {
    rawCalculations = await prisma.calculation.findMany({
      where: { userId },
      orderBy: { created_at: "desc" },
    });
  } catch (error) {
    console.error("Dashboard calculation load failed:", error);
    dbError = true;
  }

  try {
    rawPlans = await prisma.plan.findMany({
      where: { userId },
      orderBy: { created_at: "desc" },
    });
  } catch (error) {
    console.error("Dashboard plan load failed:", error);
    dbError = true;
  }

  // Safe serialization for props hydration boundary
  const initialCalculations = JSON.parse(JSON.stringify(rawCalculations));
  const initialPlans = JSON.parse(JSON.stringify(rawPlans));

  return (
    <DashboardClient
      userName={session.user.name ?? "User"}
      initialCalculations={initialCalculations}
      initialPlans={initialPlans}
      dbError={dbError}
    />
  );
}
