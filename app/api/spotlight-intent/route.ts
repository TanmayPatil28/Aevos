// @ts-nocheck
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { spotlightAgent } from "@/lib/ai/agents/spotlightAgent";

export async function POST(req: Request) {
  try {
    const { data: { user } } = await createClient().auth.getUser(); 
    if (!user) return new Response("Unauthorized", { status: 401 });
    
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    const result = await spotlightAgent.generate(query);

    let intent = "unknown";
    let confidence = 0;

    if (result.toolResults && result.toolResults.length > 0) {
      for (const tr of result.toolResults) {
        if (tr.toolName === "classify_intent" && tr.result) {
          intent = (tr.result as any).intent || "unknown";
          confidence = (tr.result as any).confidence || 0;
        }
      }
    } else {
       // fallback if the agent didn't call the tool
       const text = result.text.toLowerCase();
       if (text.includes("attendance")) intent = "attendance_analysis";
       else if (text.includes("placement")) intent = "placement_analysis";
       else if (text.includes("academic") || text.includes("risk")) intent = "academic_risk";
       else if (text.includes("cgpa")) intent = "cgpa_calculation";
       else if (text.includes("roadmap")) intent = "roadmap_generator";
       else if (text.includes("timeline")) intent = "timeline";
    }

    return NextResponse.json({ intent, confidence });

  } catch (error) {
    console.error("Spotlight Intent Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage || "Internal Server Error", intent: "unknown", confidence: 0 }, { status: 500 });
  }
}
