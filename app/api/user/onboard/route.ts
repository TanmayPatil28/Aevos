import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { institution, fullName, prnNumber, field, branch, currentYear, division } = body;

    try {
      // Upsert the user in case they don't exist in Prisma yet
      await prisma.user.upsert({
        where: { id: user.id },
        update: {
          isOnboarded: true,
          university: institution || "jspm",
          name: fullName,
        },
        create: {
          id: user.id,
          email: user.email || null,
          name: fullName,
          university: institution || "jspm",
          isOnboarded: true,
        }
      });
    } catch (dbError: any) {
      console.error("[CRITICAL DB ERROR in Onboarding]:", dbError);
      return NextResponse.json(
        { error: "Database Error", details: dbError?.message || String(dbError) },
        { status: 500 }
      );
    }

    revalidatePath("/", "layout");
    revalidatePath("/dashboard");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error onboarding user:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
