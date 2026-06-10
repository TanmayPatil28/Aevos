import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const documentPayloadSchema = z.object({
  fileName: z.string().min(1),
  fileUrl: z.string().url(),
  fileType: z.string().min(1)
});

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
    const jsonBody = await req.json();
    const parsed = documentPayloadSchema.safeParse(jsonBody);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
    }

    const { fileName, fileUrl, fileType } = parsed.data;

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
