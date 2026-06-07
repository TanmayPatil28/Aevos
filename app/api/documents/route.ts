import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const documents = await prisma.document.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(documents);
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { fileName, fileUrl, fileType } = await req.json();

    const document = await prisma.document.create({
      data: {
        userId: user.id,
        fileName,
        fileUrl,
        fileType
      }
    });
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Failed to save document:", error);
    return NextResponse.json({ error: "Failed to save document" }, { status: 500 });
  }
}
