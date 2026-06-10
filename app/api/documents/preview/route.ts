import { NextResponse } from "next/server";
import * as mammoth from "mammoth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return new NextResponse("No URL provided", { status: 400 });
    }

    // Fetch the file from the external URL (e.g. Supabase Storage)
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch document from ${url}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert DOCX to raw HTML using mammoth
    const result = await mammoth.convertToHtml({ buffer });
    
    // Wrap the HTML with a beautiful dark mode typography theme
    const styledHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            background-color: transparent;
            margin: 0;
            padding: 0;
            color: #e5e7eb;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
          .docx-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background-color: rgba(255, 255, 255, 0.02);
            border-radius: 8px;
            margin-top: 20px;
            margin-bottom: 20px;
          }
          h1 { font-size: 2em; font-weight: 700; margin-bottom: 1em; color: #ffffff; }
          h2 { font-size: 1.5em; font-weight: 600; margin-bottom: 0.8em; color: #ffffff; }
          h3 { font-size: 1.25em; font-weight: 600; margin-bottom: 0.6em; color: #ffffff; }
          p { margin-bottom: 1em; line-height: 1.7; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
          th, td { border: 1px solid rgba(255,255,255,0.1); padding: 12px; text-align: left; }
          th { background-color: rgba(255,255,255,0.05); }
          a { color: #818cf8; text-decoration: none; }
          a:hover { text-decoration: underline; }
          ul, ol { margin-left: 1.5em; margin-bottom: 1em; line-height: 1.7; }
          li { margin-bottom: 0.5em; }
          strong { color: #ffffff; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="docx-container">
          ${result.value || "<p><i>Empty document</i></p>"}
        </div>
      </body>
      </html>
    `;

    return new NextResponse(styledHtml, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error("DOCX Preview generation error:", error);
    return new NextResponse(`
      <html>
        <body style="color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: transparent;">
          <div style="text-align: center;">
            <p>Failed to generate document preview.</p>
            <p style="font-size: 12px; opacity: 0.6;">The document might be corrupted or in an unsupported format.</p>
          </div>
        </body>
      </html>
    `, { status: 500, headers: { 'Content-Type': 'text/html' } });
  }
}
