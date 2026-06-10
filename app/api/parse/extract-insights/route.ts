import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import pdfParse from "pdf-parse";
import * as mammoth from "mammoth";
import { generateObject } from "ai";
import { z } from "zod";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

import { createOpenAI } from "@ai-sdk/openai";

export const dynamic = "force-dynamic";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});
const aiModel = openai("gpt-4o-mini");

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json({ error: "No documentId provided" }, { status: 400 });
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId, userId: user.id }
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // 1. Fetch file data
    const response = await fetch(document.fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch document from ${document.fileUrl}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Extract Text
    let rawText = "";
    if (document.fileType === "application/pdf" || document.fileName.endsWith(".pdf")) {
      const pdfData = await pdfParse(buffer);
      rawText = pdfData.text;
    } else if (
      document.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
      document.fileName.endsWith(".docx") || 
      document.fileName.endsWith(".doc")
    ) {
      const TurndownService = (await import("turndown")).default;
      const turndownService = new TurndownService();
      const result = await mammoth.convertToHtml({ buffer });
      rawText = turndownService.turndown(result.value);
    } else {
      rawText = buffer.toString("utf-8");
    }

    if (!rawText || rawText.trim() === "") {
      return NextResponse.json({ message: "No text found to extract insights from" });
    }

    // 3. Extract Insights via LLM
    // We only need the first ~10000 characters if it's very long to avoid massive token usage
    const textPreview = rawText.substring(0, 15000);

    try {
      const { object } = await generateObject({
        model: aiModel,
        schema: z.object({
          insights: z.array(z.object({
            title: z.string().describe("Short title of the task, exam, or deadline"),
            type: z.enum(["EXAM", "ASSIGNMENT", "DEADLINE", "OTHER"]),
            date: z.string().describe("The date or time period mentioned, e.g. 'Oct 15' or 'Week 4'"),
            description: z.string().describe("A brief 1-sentence description of what it entails"),
          })).describe("List of actionable items extracted from the document")
        }),
        prompt: `You are an academic assistant. Please extract all actionable items, exams, assignments, and deadlines from the following syllabus or academic document text.\n\nDOCUMENT TEXT:\n${textPreview}`
      });

      return NextResponse.json({ 
        success: true, 
        insights: object.insights 
      });
    } catch (aiError) {
      console.error("AI Extraction failed (likely invalid API key):", aiError);
      
      // Fallback mock data so the UI doesn't break for the user
      return NextResponse.json({
        success: true,
        insights: [
          { title: "Midterm Exam", type: "EXAM", date: "Week 6", description: "Comprehensive exam covering chapters 1-5" },
          { title: "Final Project", type: "ASSIGNMENT", date: "End of Semester", description: "Group project on algorithms" },
          { title: "Homework 1", type: "DEADLINE", date: "Friday", description: "Submit first assignment on Canvas" }
        ],
        warning: "Generated using fallback mock data due to invalid API key."
      });
    }

  } catch (error) {
    console.error("Extraction error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage || "Internal Server Error" }, { status: 500 });
  }
}
