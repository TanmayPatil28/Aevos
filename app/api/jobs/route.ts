import { verifySignatureAppRouter } from "@upstash/qstash/dist/nextjs";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Define the shape of our background jobs
export type JobPayload = {
  type: "PARSE_MARKSHEET" | "CALCULATE_TRAJECTORY" | "SYNC_ATTENDANCE";
  userId: string;
  data: any;
};

// This endpoint receives webhooks from Upstash QStash
// The verifySignatureAppRouter middleware ensures only QStash can call this endpoint
async function handler(req: Request) {
  try {
    const body: JobPayload = await req.json();
    console.log(`[Jobs] Received background task: ${body.type} for user ${body.userId}`);

    switch (body.type) {
      case "PARSE_MARKSHEET":
        // TODO: Implement PDF OCR processing here in the future
        console.log("[Jobs] Processing heavy marksheet parsing...");
        // await processMarksheet(body.userId, body.data.fileUrl);
        break;

      case "CALCULATE_TRAJECTORY":
        // TODO: Implement time-series GPA prediction
        console.log("[Jobs] Running nightly GPA trajectory model...");
        // await updateGpaTrajectory(body.userId);
        break;

      default:
        console.log(`[Jobs] Unknown job type: ${body.type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Jobs] Failed to process background task:", error);
    return NextResponse.json({ error: "Failed to process job" }, { status: 500 });
  }
}

// Wrap the handler with QStash's security middleware if keys exist, else use raw handler for dev
const hasQStashKeys = process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY;

export const POST = hasQStashKeys 
  ? verifySignatureAppRouter(handler)
  : handler;
