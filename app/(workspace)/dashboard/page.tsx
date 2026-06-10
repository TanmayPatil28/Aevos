import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Calculation, Plan, AcademicSnapshot } from "@prisma/client";
import dynamic from "next/dynamic";
const DashboardClient = dynamic(() => import("./DashboardClient"), { ssr: false });

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    redirect("/login");
  }

  const userId = user.id;

  let rawCalculations: Calculation[] = [];
  let rawPlans: Plan[] = [];
  let rawEnrollments: unknown[] = [];
  let rawSnapshot: AcademicSnapshot | null = null;

  try {
    rawCalculations = await prisma.calculation.findMany({
      where: { userId },
      orderBy: { created_at: "desc" },
    });
  } catch (error) {
    console.error("Dashboard calculation load failed:", error);
  }

  try {
    rawPlans = await prisma.plan.findMany({
      where: { userId },
      orderBy: { created_at: "desc" },
    });
  } catch (error) {
    console.error("Dashboard plan load failed:", error);
  }

  try {
    rawEnrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: true,
      },
    });
  } catch (error) {
    console.error("Dashboard enrollments load failed:", error);
  }

  try {
    rawSnapshot = await prisma.academicSnapshot.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Dashboard snapshot load failed:", error);
  }

  // Safe serialization for props hydration boundary
  const initialCalculations = JSON.parse(JSON.stringify(rawCalculations));
  const initialPlans = JSON.parse(JSON.stringify(rawPlans));
  const initialEnrollments = JSON.parse(JSON.stringify(rawEnrollments));
  const initialSnapshot = rawSnapshot ? JSON.parse(JSON.stringify(rawSnapshot)) : null;

  return (
    <DashboardClient 
      initialCalculations={initialCalculations}
      initialPlans={initialPlans}
      initialEnrollments={initialEnrollments}
      initialSnapshot={initialSnapshot}
    />
  );
}
