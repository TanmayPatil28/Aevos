import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `
You are an expert career architect and placement officer.
Your task is to generate a highly personalized, node-based skill roadmap for a user trying to get a specific job.
You will be provided with:
1. Target Role
2. Target Job Description (JD)
3. The User's Current Resume

Generate a valid JSON object with TWO arrays: "nodes" and "edges".
This JSON will be fed directly into React Flow.

"nodes" should be an array of objects representing skills or topics to learn.
Each node must have:
- id (string, e.g., "react-basics")
- type (string, MUST BE one of: "golden", "alternative", "bonus")
- position (object with x and y integers. Space them out vertically and horizontally. e.g. x: 250, y: 50. Increase y by 150 for each step down the path)
- data (object containing):
  - label (string, short title)
  - description (string, 1-2 sentences)
  - category (string, MUST match the type: "golden", "alternative", or "bonus")
  - difficulty (string: "Beginner", "Medium", or "Advanced")
  - estHours (number)
  - milestones (array of objects with "id" and "text")
  - resources (array of objects with "id", "title", "url", "type" (article/video/course/project))

"edges" should be an array of objects connecting the nodes:
- id (string, e.g., "e-react-next")
- source (string, node id)
- target (string, node id)
- animated (boolean, true for the main path)

Focus on the EXACT gaps between the Resume and the JD. Make the roadmap extremely targeted. Provide at least 5 nodes.

RETURN ONLY VALID JSON. No markdown backticks.
`;

export async function POST(req: Request) {
  try {
    const { targetRole, targetJd, userId } = await req.json();

    if (!targetRole || !targetJd || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch user's career profile to get resumeText
    const userProfile = await prisma.careerProfile.findUnique({
      where: { userId }
    });

    if (!userProfile) {
      return NextResponse.json({ error: "User career profile not found" }, { status: 404 });
    }

    const resumeText = userProfile.resumeText;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const prompt = `
      Target Role: ${targetRole}
      Target JD: ${targetJd}
      
      User Resume:
      ${resumeText}
    `;

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "user", parts: [{ text: prompt }] }
      ]
    });

    const responseText = result.response.text();
    const roadmapData = JSON.parse(responseText);

    // Save to database
    const dynamicRoadmap = await prisma.dynamicRoadmap.create({
      data: {
        userId,
        targetRole,
        targetJd,
        nodes: roadmapData.nodes,
        edges: roadmapData.edges,
      }
    });

    return NextResponse.json({ success: true, roadmapId: dynamicRoadmap.id });
  } catch (error: any) {
    console.error("Dynamic Roadmap Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate roadmap" }, { status: 500 });
  }
}
