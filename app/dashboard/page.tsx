import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [rawCalculations, rawPlans] = await Promise.all([
    prisma.calculation.findMany({
      where: { userId },
      orderBy: { created_at: "desc" },
    }),
    prisma.plan.findMany({
      where: { userId },
      orderBy: { created_at: "desc" },
    }),
  ]);

  // Safe serialization for props hydration boundary
  const initialCalculations = JSON.parse(JSON.stringify(rawCalculations));
  const initialPlans = JSON.parse(JSON.stringify(rawPlans));

  return (
    <DashboardClient
      userName={session.user.name ?? "User"}
      initialCalculations={initialCalculations}
      initialPlans={initialPlans}
    />
  );
}
