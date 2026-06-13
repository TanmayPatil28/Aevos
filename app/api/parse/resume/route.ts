import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getGeminiKey } from '@/lib/career/ai-keys';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fallback logic for userId to allow testing without being logged in
    let userId = user?.id;
    
    if (!userId) {
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
        userId = firstUser.id;
      } else {
        return NextResponse.json({ error: 'Unauthorized and no fallback user found' }, { status: 401 });
      }
    }

    const data = await request.formData();
    const file = data.get('file') as File;
    const targetJD = (data.get('jobDescription') || data.get('targetJD')) as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const apiKey = getGeminiKey();
    if (!apiKey) {
      console.warn("No GEMINI_API_KEY found, falling back to mock ATS pipeline.");
      // Mocked response fallback
      const mockResumeText = "Mocked resume text content. Experienced Software Engineer with a background in building scalable web applications using React, Node.js, and Prisma.";
      const mockSkills = ["React", "Node.js", "TypeScript", "Next.js", "PostgreSQL", "AWS"];
      const mockAtsScore = 85;
      const mockActionPlan = [
        { id: "1", task: "Add more quantifiable metrics to your recent role.", completed: false },
        { id: "2", task: "Include keyword 'GraphQL' as mentioned in the job description.", completed: false },
        { id: "3", task: "Rephrase your summary to focus on leadership skills.", completed: false }
      ];
      const mockProjects = [
        {
          name: "E-commerce Platform",
          techStack: ["Next.js", "Stripe", "Tailwind CSS"],
          impact: "Increased sales by 25% by improving checkout flow.",
          isAIGenerated: false
        },
        {
          name: "AI Document Analyzer",
          techStack: ["Python", "FastAPI", "React", "OpenAI"],
          impact: "Extrapolated project based on 'Python' and 'AI' skills to demonstrate potential capability. Automated processing of 10k+ documents.",
          isAIGenerated: true
        }
      ];

      await prisma.careerProfile.upsert({
        where: { userId: userId },
        update: { resumeText: mockResumeText, skills: mockSkills, atsScore: mockAtsScore, actionPlan: mockActionPlan, projects: mockProjects },
        create: { userId: userId, resumeText: mockResumeText, skills: mockSkills, atsScore: mockAtsScore, actionPlan: mockActionPlan, projects: mockProjects }
      });

      return NextResponse.json({
        skills: mockSkills,
        atsScore: mockAtsScore,
        actionPlan: mockActionPlan,
        projects: mockProjects,
        resumeText: mockResumeText,
        company: "Mock Company",
        summary: "An experienced mock candidate.",
        coursework: ["Data Structures", "Algorithms"]
      });
    }

    // --- LIVE GEMINI 2.5 FLASH PIPELINE ---
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    
    const systemInstruction = `You are JARVIS, an advanced ATS Resume Analyzer acting as a hyper-critical Big Tech recruiter.
Your task is to parse the user's PDF resume and evaluate it against the Target Job Description (if provided).
You must return a massive, detailed JSON object containing an 8-phase resume audit exactly matching this structure:
{
  "company": "Company Name from JD, or 'General'",
  "summary": "Brief 1 sentence executive summary of the candidate",
  "skills": ["Extracted", "Skills"],
  "coursework": ["Extracted", "Coursework"],
  "atsScore": 50,
  "actionPlan": [{"id":"1", "task": "Actionable task", "completed": false}],
  "projects": [
    {"name": "Project Name", "techStack": ["Tech1"], "impact": "Impact string", "isAIGenerated": false}
  ],
  "detailedAudit": {
    "header": {
      "candidateName": "Candidate Name",
      "subtitle": "Brief subtitle / target role",
      "scores": {
        "atsScore": 50,
        "recruiterScore": 45,
        "techManagerScore": 40,
        "accentureMatch": 50
      }
    },
    "phase1": {
      "categories": [
        {"name": "Format & ATS Compatibility", "score": "11/20", "scoreColor": "amber", "issues": "Issues found"}
      ],
      "criticalWeaknesses": [
        {"title": "Issue Title", "atsImpact": "impact", "recruiterImpact": "impact", "type": "error"}
      ]
    },
    "phase2": {
      "detectedSkills": ["Java", "Python"],
      "missingSkills": ["Spring Boot"],
      "highPriorityKeywords": ["Agile"],
      "medPriorityKeywords": ["Cloud"],
      "optPriorityKeywords": ["React"],
      "skillWarnings": [
        {"title": "Java mentioned only in skills", "desc": "Should appear in summary..."}
      ]
    },
    "phase3": {
      "firstImpression": "Clean layout...",
      "strengths": ["1. CGPA 10/10"],
      "redFlags": ["1. No graduation year"],
      "shortlistReasons": "Reasons here...",
      "rejectReasons": "Reasons here..."
    },
    "phase4": [
      {
        "name": "Project Name",
        "currentRating": 4,
        "industryValue": 8,
        "recruiterInterest": 7,
        "accentureRelevance": 8,
        "feedback": "Why it's weak",
        "beforeBullets": ["Original bullet 1"],
        "afterBullets": ["STAR rewritten bullet with metrics"]
      }
    ],
    "phase5": [
      {
        "sectionName": "Profile Summary",
        "beforeText": "Original text",
        "beforeFeedback": "Why it's weak",
        "afterText": "Rewritten ATS optimized text"
      }
    ],
    "phase6": {
      "matchedRequirements": ["MCA degree"],
      "partialRequirements": ["Web Dev"],
      "missingRequirements": ["Cloud"],
      "improvements": [
        {"title": "Improvement title", "desc": "description", "type": "success"}
      ]
    },
    "phase7": "FULL PLAIN TEXT REWRITTEN RESUME GOES HERE",
    "phase8": {
      "currentProbability": 35,
      "currentFeedback": "Feedback here",
      "afterProbability": 68,
      "afterFeedback": "Feedback here"
    },
    "phase9": {
      "verdictLabel": "FINAL VERDICT",
      "verdictValue": "NOT READY",
      "verdictText": "Your resume needs 2-3 weeks of intense project upgrades before applying to Accenture.",
      "actionCards": [
        { "num": "01", "title": "Learn Spring Boot", "desc": "Do a 10 hour course." },
        { "num": "02", "title": "Rewrite Project 1", "desc": "Use the STAR format." }
      ]
    }
  }
}
IMPORTANT:
1. If the Target JD contains specific keywords that the user does not have, but their academic background suggests they could easily do it, you MUST invent (extrapolate) 1 new project or bullet point to hit that keyword. Set 'isAIGenerated' to true for that project.
2. Return ONLY valid JSON. Do not include markdown \`\`\`json blocks. Just the raw JSON object starting with { and ending with }.`;

    const promptText = targetJD && targetJD.trim().length > 5 
      ? `Target Job Description:\n${targetJD}\n\nPlease parse the attached resume PDF and generate an ATS optimized profile.` 
      : `Please parse the attached resume PDF and provide a general evaluation since no target JD was provided. Do NOT extrapolate any AI projects.`;

    const geminiPayload = {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{
        parts: [
          { text: promptText },
          { inlineData: { mimeType: file.type || "application/pdf", data: base64Data } }
        ]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    };

    const model = "gemini-2.5-flash";
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload)
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      throw new Error(`Gemini API failed: ${errText}`);
    }

    const geminiData = await geminiResponse.json();
    let generatedJsonText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedJsonText) {
      throw new Error('Gemini returned an empty response');
    }

    // Clean markdown if Gemini accidentally included it
    generatedJsonText = generatedJsonText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(generatedJsonText);
    const resumeText = "Extracted by Gemini API";

    // Upsert into CareerProfile
    await prisma.careerProfile.upsert({
      where: { userId: userId },
      update: {
        resumeText: resumeText,
        skills: parsedData.skills,
        atsScore: parsedData.atsScore,
        actionPlan: parsedData.actionPlan,
        projects: parsedData.projects,
        detailedAudit: parsedData.detailedAudit
      },
      create: {
        userId: userId,
        resumeText: resumeText,
        skills: parsedData.skills,
        atsScore: parsedData.atsScore,
        actionPlan: parsedData.actionPlan,
        projects: parsedData.projects,
        detailedAudit: parsedData.detailedAudit
      }
    });

    return NextResponse.json({
      skills: parsedData.skills,
      atsScore: parsedData.atsScore,
      actionPlan: parsedData.actionPlan,
      projects: parsedData.projects,
      resumeText: resumeText,
      company: parsedData.company,
      summary: parsedData.summary,
      coursework: parsedData.coursework,
      detailedAudit: parsedData.detailedAudit
    });
  } catch (error) {
    console.error('Resume Parse Error:', error);
    return NextResponse.json(
      { error: 'Failed to parse resume', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
