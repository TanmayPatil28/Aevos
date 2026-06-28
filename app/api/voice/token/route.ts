import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  let cartesiaToken = null;
  let deepgramKey = null;
  
  try {
    if (process.env.CARTESIA_API_KEY) {
      cartesiaToken = process.env.CARTESIA_API_KEY;
    }
  } catch (err) {
    console.warn("Failed to fetch Cartesia token:", err);
  }

  try {
    // We will return the Deepgram API key securely for this session
    deepgramKey = process.env.DEEPGRAM_API_KEY?.split(',')[0] || process.env.DEEPGRAM_API_KEY || null;

    return NextResponse.json({
      cartesiaToken,
      deepgramKey,
    });
  } catch (error: any) {
    console.error("Token generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
