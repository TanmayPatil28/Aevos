import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
// @ts-expect-error TS1192
import pdfParse from "pdf-parse";
import * as mammoth from "mammoth";
import { memorizeDocumentChunks } from "@/lib/ai/memory";

export const dynamic = "force-dynamic";

function chunkText(text: string, maxWords: number = 500): string[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentWordCount = 0;

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/);
    if (currentWordCount + words.length > maxWords && currentChunk.length > 0) {
      chunks.push(currentChunk.join("\n\n"));
      currentChunk = [];
      currentWordCount = 0;
    }
    currentChunk.push(paragraph);
    currentWordCount += words.length;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join("\n\n"));
  }

  return chunks;
}

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
      // Use convertToHtml to preserve tables, headings, and lists
      const result = await mammoth.convertToHtml({ buffer });
      rawText = turndownService.turndown(result.value);
    } else {
      // Basic text fallback
      rawText = buffer.toString("utf-8");
    }

    // 3. Chunk text
    const chunks = chunkText(rawText, 500);

    if (chunks.length === 0) {
      return NextResponse.json({ message: "No text found to embed" });
    }

    // 4. Batch embed and store
    const success = await memorizeDocumentChunks(chunks, document.id);

    if (!success) {
      return NextResponse.json({ error: "Failed to memorize document chunks" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      chunksProcessed: chunks.length 
    });

  } catch (error) {
    console.error("Document parsing error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage || "Internal Server Error" }, { status: 500 });
  }
}
