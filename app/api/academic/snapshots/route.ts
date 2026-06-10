import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { validateSnapshotPayload } from "@/lib/academic-intelligence/hydration/hydrationEngine";
import { generateStructuralHash } from "@/lib/academic-intelligence/hashing/structuralHash";
import { z } from "zod";

const snapshotPayloadSchema = z.object({
  academicProfile: z.any(),
  sourceType: z.string(),
  sourceInstitution: z.string(),
  snapshotType: z.string().optional().default("official_import"),
  parserVersion: z.string().optional().default("1.0"),
  regulationVersion: z.string().optional().default("1.0"),
  normalizationVersion: z.string().optional().default("1.0"),
  confidenceScore: z.number().optional().default(100),
});

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const activeOnly = searchParams.get("activeOnly") === "true";

    if (activeOnly) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { activeSnapshotId: true },
      });

      if (!dbUser?.activeSnapshotId) {
        return NextResponse.json({ snapshot: null });
      }

      const activeSnapshot = await prisma.academicSnapshot.findUnique({
        where: { id: dbUser.activeSnapshotId },
      });

      return NextResponse.json({ snapshot: activeSnapshot });
    }

    const snapshots = await prisma.academicSnapshot.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ snapshots });
  } catch (error) {
    console.error("[AcademicSnapshots GET Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jsonBody = await req.json();
    const parsed = snapshotPayloadSchema.safeParse(jsonBody);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
    }

    const { 
      academicProfile, 
      sourceType, 
      sourceInstitution, 
      snapshotType,
      parserVersion,
      regulationVersion,
      normalizationVersion,
      confidenceScore,
    } = parsed.data;

    // 1. Validate JSON strictly through the Hydration Engine
    let validatedProfile;
    try {
      validatedProfile = validateSnapshotPayload(academicProfile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: `Validation Error: ${errorMessage}` }, { status: 400 });
    }

    // 2. Generate Structural Hash to prevent duplicate identical imports
    const checksumHash = generateStructuralHash(validatedProfile);

    // 3. Create Immutable Snapshot and Update User Pointer atomically
    const newSnapshot = await prisma.$transaction(async (tx: any) => {
      const snapshot = await tx.academicSnapshot.create({
        data: {
          userId: user.id,
          sourceType,
          sourceInstitution,
          snapshotType,
          parserVersion,
          regulationVersion,
          normalizationVersion,
          confidenceScore,
          checksumHash,
          verificationStatus: "verified", // Assume newly imported payloads are verified for now
          academicProfile: validatedProfile as any,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { activeSnapshotId: snapshot.id },
      });

      return snapshot;
    });

    return NextResponse.json({ success: true, snapshot: newSnapshot }, { status: 201 });
  } catch (error) {
    console.error("[AcademicSnapshots POST Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
