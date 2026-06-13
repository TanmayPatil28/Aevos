import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Authenticate via NextAuth session cookies
    // The Chrome Extension's background.js will make this request, 
    // and Chrome will automatically attach the user's GradeFlow cookies!
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized. Please log in to GradeFlow." }, { status: 401 });
    }

    // Fetch the user's latest Career Profile
    const profile = await prisma.careerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile || !profile.detailedAudit) {
      return NextResponse.json({ error: "No parsed resume found. Please audit a resume first." }, { status: 404 });
    }

    // Extract Phase 7 (The Final Plain Text Resume) and Phase 4/5 data for DOM mapping
    const detailedAudit = profile.detailedAudit as any;
    
    // We package the data specifically for the extension's DOM injector
    const extensionPayload = {
      candidateName: detailedAudit.header?.candidateName || "",
      phase7Text: detailedAudit.phase7 || "", // Raw text block if they want to copy-paste
      // We can also send structured data if the ATS needs it
      skills: detailedAudit.phase2?.detectedSkills || [],
      projects: detailedAudit.phase4 || [],
      sections: detailedAudit.phase5 || []
    };

    // Allow CORS from the extension
    return NextResponse.json(extensionPayload, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      }
    });

  } catch (error: any) {
    console.error("Extension Resume API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume for extension", details: error.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
