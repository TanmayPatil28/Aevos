import React from "react";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import WorkspaceClientLayout from "./ClientLayout"; 

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
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
            // Ignored when called from Server Component
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  let prismaUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!prismaUser) {
    // Lazy sync creation if user does not exist in DB yet
    prismaUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        name: user?.user_metadata?.full_name || null,
        university: "jspm",
        isOnboarded: false,
      },
    });
  }

  if (!prismaUser.isOnboarded) {
    redirect("/onboarding");
  }

  return <WorkspaceClientLayout>{children}</WorkspaceClientLayout>;
}
