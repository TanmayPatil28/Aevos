import { NextRequest, NextResponse } from 'next/server';
import { runMonteCarloSimulation } from '@/lib/engines/monteCarlo';
import { solveTimeConstraints, ClassSession } from '@/lib/engines/constraintSolver';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rateLimit';

// --- Agent System Prompts: Each agent has a genuinely distinct persona and reasoning bias ---
export function buildSystemPrompt(
  agent: string,
  strategy: string,
  currentSchedule: any[],
  currentDay: string,
  tomorrowDay: string,
  remainingWeekdays: string[],
  upcomingExamInfo: string,
  userName: string = "there"
): string {
  const scheduleJson = JSON.stringify(currentSchedule, null, 2);

  const sharedInstructions = `
You are talking to ${userName}. Use their name naturally when greeting or reassuring them.
Today is ${currentDay}. Tomorrow is ${tomorrowDay}. Remaining weekdays this week: ${remainingWeekdays.join(', ') || 'none'}.
Here is the user's current schedule data:
${scheduleJson}

Output your response strictly as JSON with this schema:
{ "thought_process": "Analyze the JSON schedule here first...", "intent": "enum_value", "targetDays": ["Monday", ...], "targetClass": "name or null", "aiReply": "Your contextual response here" }

Intent must be one of: 'conversational', 'block_time', 'max_consecutive', 'max_time_off', 'grade_impact', 'skip_specific'.
If the user asks for information, use 'conversational'. 
If they mention a specific day by name, extract it into targetDays. 
If they say "tomorrow", resolve it to ${tomorrowDay} (the actual next day).
If they say "today", resolve it to ${currentDay}.
If they want to skip a specific class, extract the class name into targetClass.
NEVER guess a day name. Always resolve relative terms using the actual dates provided above.
`;

  if (agent === 'Compliance Agent') {
    return `You are the Compliance Agent for the Time Liquidity Engine — a strict risk enforcer whose primary duty is ensuring the user never falls below their mandatory 80% attendance threshold.
The user is using strategy: ${strategy}.

Your reasoning style:
- You are conservative and cautious by nature. When in doubt, recommend attending classes.
- Your target attendance threshold is strictly 80% (regardless of the user's strategy).
- If reallocating a day would bring attendance risk above 15%, you MUST warn strongly and recommend against it.
- Always lead with the risk consequence BEFORE any approval. Even for safe reallocations, remind the user of their remaining buffer.
- Use precise, formal language. Reference actual percentages and class counts from the schedule data.
- If the user's current risk exposure is above 20%, you MUST veto (refuse) any further absences. Explain your veto clearly in plain language, e.g., "I am denying this request because your risk of falling below the 75% college requirement is too high."
${sharedInstructions}`;
  }

  if (agent === 'Deliverable Agent') {
    return `You are the Deliverable Agent for the Time Liquidity Engine — an assignment and exam deadline tracker whose primary duty is cross-referencing the user's academic commitments before approving any schedule reallocations.
The user is using strategy: ${strategy}.

Your reasoning style:
- Always think about WHAT is due before deciding WHEN to reallocate time.
- Your target attendance threshold is 75%, or 78% during Exam Sprint.
- If a backlog exam date or assignment deadline is within the next 7 days, prioritize keeping classes related to those subjects. Warn the user explicitly about the upcoming deadline.
- You deprioritize pure "free time" optimization and instead frame reallocation as "protecting study time for deliverables".
- Reference specific class names from the schedule and connect them to upcoming assessments when relevant.
- Use deadline-aware language: "With your backlog exam approaching...", "Given your upcoming submission..."
${upcomingExamInfo ? `Upcoming backlog exams within 7 days: ${upcomingExamInfo}` : "No backlog exams are scheduled in the next 7 days."}
${sharedInstructions}`;
  }

  // Default: Tactical Negotiator — smart schedule optimizer
  return `You are the Tactical Negotiator for the Attendance Optimizer — a smart schedule assistant whose primary goal is helping students use their attendance buffer wisely while staying safe.
The user is using strategy: ${strategy}.

Your reasoning style:
- You are solution-oriented and encouraging. Lead with what IS possible, not what isn't.
- Your target attendance threshold is 60% (for Survival or Burnout Recovery strategy) or 65% (for Balanced or other strategies).
- Look for the maximum number of classes that can safely be missed given the current schedule data.
- Use clear, student-friendly language. Say "attendance standing" instead of "Portfolio Balance". Say "remaining safe absences" instead of "Time Allocation credits". You may use "Risk Exposure" when summarizing attendance risk levels as a metric label.
- Only warn about risk if it would genuinely cross above 25%. Below that, be encouraging and proactive.
- Suggest practical strategies: grouping absences on low-impact days, identifying back-to-back sessions that can be cleared together.
${sharedInstructions}`;
}

// --- Date resolution utilities ---
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function resolveTemporalExpressions(prompt: string): { resolvedDays: string[]; resolvedIntent?: string } {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const todayIdx = now.getDay(); // 0=Sun, 1=Mon...
  const todayName = WEEKDAY_NAMES[todayIdx];
  const tomorrowIdx = (todayIdx + 1) % 7;
  const tomorrowName = WEEKDAY_NAMES[tomorrowIdx];

  const lowerPrompt = prompt.toLowerCase();
  const resolvedDays: string[] = [];
  let resolvedIntent: string | undefined = undefined;

  // Explicit day names
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach(day => {
    if (lowerPrompt.includes(day.toLowerCase())) resolvedDays.push(day);
  });

  // "today" -> Resolve to the current weekday name based on system time in Asia/Kolkata
  if (lowerPrompt.includes('today')) {
    if (!resolvedDays.includes(todayName)) {
      resolvedDays.push(todayName);
    }
  }

  // "tomorrow" -> Resolve to actual tomorrow's weekday name
  if (lowerPrompt.includes('tomorrow')) {
    if (!resolvedDays.includes(tomorrowName)) {
      resolvedDays.push(tomorrowName);
    }
  }

  // "this week" -> Resolve to the remaining weekdays from today+1 through Friday
  if (lowerPrompt.includes('this week')) {
    for (let i = todayIdx + 1; i <= 5; i++) { // 1=Mon...5=Fri
      const name = WEEKDAY_NAMES[i];
      if (!resolvedDays.includes(name)) resolvedDays.push(name);
    }
    resolvedIntent = 'max_time_off';
  }

  // "next monday" -> Resolve to the actual next Monday date
  if (lowerPrompt.includes('next monday')) {
    const nextMonday = new Date(now);
    const currentDayOfWeek = now.getDay();
    const daysToAdd = currentDayOfWeek === 1 ? 7 : (8 - currentDayOfWeek) % 7;
    nextMonday.setDate(now.getDate() + daysToAdd);
    const formattedDate = nextMonday.toISOString().split('T')[0];
    if (!resolvedDays.includes(formattedDate)) {
      resolvedDays.push(formattedDate);
    }
    if (!resolvedDays.includes('Monday')) {
      resolvedDays.push('Monday');
    }
  }

  // Intent heuristics
  if (!resolvedIntent) {
    if (lowerPrompt.includes('consecutive') || lowerPrompt.includes('row')) {
      resolvedIntent = 'max_consecutive';
    } else if (lowerPrompt.includes('optimize') || lowerPrompt.includes('time off') || lowerPrompt.includes('exams')) {
      resolvedIntent = 'max_time_off';
    } else if (lowerPrompt.includes('grade')) {
      resolvedIntent = 'grade_impact';
    } else if (resolvedDays.length > 0 && (lowerPrompt.includes('skip') || lowerPrompt.includes('bunk') || lowerPrompt.includes('drop') || lowerPrompt.includes('leave') || lowerPrompt.includes('reallocate'))) {
      resolvedIntent = 'block_time';
    }
  }

  return { resolvedDays, resolvedIntent };
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimitResult = rateLimit(ip, 30, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to access the Time Liquidity Engine.' },
        { status: 401 }
      );
    }

    const { prompt, currentSchedule, safeBunks, currentRuinRisk, agent, strategy } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // --- Fetch REAL attendance data FIRST (needed for empty state detection) ---
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id }
    });

    let realTotalClasses = 0;
    let realClassesConducted = 0;
    let realClassesAttended = 0;

    for (const e of enrollments) {
      realTotalClasses += e.attendanceTotal;
    }

    const enrollmentIds = enrollments.map(e => e.id);
    const logs = await prisma.attendanceLog.findMany({
      where: { enrollmentId: { in: enrollmentIds } },
      select: { enrollmentId: true, status: true }
    });

    for (const log of logs) {
      realClassesConducted++;
      if (log.status === 'PRESENT') {
        realClassesAttended++;
      }
    }

    // --- Empty State Backend Handling ---
    if (enrollments.length === 0) {
      return NextResponse.json({
        content: null,
        action: 'empty_state',
        emptyState: true,
        metrics: {
          newRuinProbability: 0,
          newSafeBunks: 0,
          newStrategicSkips: 0
        }
      });
    }

    // --- Resolve dates for LLM and fallback ---
    const nowKolkata = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const todayIdx = nowKolkata.getDay();
    const currentDay = WEEKDAY_NAMES[todayIdx];
    const tomorrowDay = WEEKDAY_NAMES[(todayIdx + 1) % 7];
    const remainingWeekdays: string[] = [];
    for (let i = todayIdx + 1; i <= 5; i++) remainingWeekdays.push(WEEKDAY_NAMES[i]);

    // --- Fetch Deliverable Agent data: upcoming backlog exam dates within 7 days ---
    const nowUTC = new Date();
    const sevenDaysFromNowUTC = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    let upcomingExamInfo = '';
    const examCourseNames: string[] = [];
    const examCourseCodes: string[] = [];

    try {
      const backlogs = await prisma.backlogRecord.findMany({
        where: {
          userId: user.id,
          nextExamDate: {
            gte: nowUTC,
            lte: sevenDaysFromNowUTC
          }
        },
        include: { course: true },
        orderBy: { nextExamDate: 'asc' }
      });

      backlogs.forEach(b => {
        examCourseNames.push(b.course.name.toLowerCase());
        examCourseCodes.push(b.course.code.toLowerCase());
      });

      if (backlogs.length > 0) {
        upcomingExamInfo = `\n\nIMPORTANT — Upcoming backlog exams within 7 days:\n` +
          backlogs.map(b => `- ${b.course.name} (${b.course.code}): exam on ${b.nextExamDate?.toLocaleDateString('en-IN')}`).join('\n');
      }
    } catch (_) {
      // Non-critical — proceed without exam data
    }

    // Prioritize keeping classes related to upcoming exams for Deliverable Agent
    if (agent === 'Deliverable Agent' && examCourseNames.length > 0) {
      currentSchedule.forEach((session: any) => {
        const titleLower = session.title?.toLowerCase() || '';
        const codeLower = session.courseCode?.toLowerCase() || '';
        const matchesExam = examCourseNames.some(name => titleLower.includes(name)) ||
                            examCourseCodes.some(code => codeLower.includes(code));
        if (matchesExam) {
          session.isMandatory = true;
        }
      });
    }

    // --- 1. NLP / Intent Extraction via Gemini LLM ---
    const { GoogleGenAI } = require('@google/genai');
    const geminiKeys = process.env.GEMINI_API_KEYS || '';
    const keys = geminiKeys.split(',').map(k => k.trim()).filter(Boolean);

    let targetDays: string[] = [];
    let targetClass: string | undefined = undefined;
    let intent: string = 'block_time';
    let aiReply = "I'm analyzing your schedule right now...";
    let llmSuccess = false;

    if (keys.length > 0) {
      const basicDbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { name: true } });
      const userName = basicDbUser?.name?.split(' ')[0] || "there";

      const systemPrompt = buildSystemPrompt(
        agent || 'Tactical Negotiator',
        strategy || 'Balanced',
        currentSchedule || [],
        currentDay,
        tomorrowDay,
        remainingWeekdays,
        upcomingExamInfo,
        userName
      );

      for (const apiKey of keys) {
        try {
          const ai = new GoogleGenAI({ apiKey: apiKey });
          
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `User Prompt: ${prompt}`,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json"
            }
          });

          let responseText = response.text || '';
          responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(responseText);
          targetDays = parsed.targetDays || [];
          intent = parsed.intent || 'block_time';
          targetClass = parsed.targetClass || undefined;
          aiReply = parsed.aiReply || aiReply;
          llmSuccess = true;
          break;
        } catch (err) {
          console.error(`LLM Error with key: ${apiKey.substring(0, 5)}...:`, err);
        }
      }
    }

    if (!llmSuccess) {
      // R4: Proper date resolution fallback — no hardcoded day names
      console.warn("No valid GEMINI_API_KEYS worked, falling back to date-aware heuristics");

      // Check for help_offline intent FIRST (before temporal parsing)
      const lowerPrompt = prompt.toLowerCase();
      if (lowerPrompt.includes('help_offline') || lowerPrompt.includes('what can i do offline') || (lowerPrompt.includes('help') && lowerPrompt.includes('offline'))) {
        intent = 'help_offline';
      } else {
        const { resolvedDays, resolvedIntent } = resolveTemporalExpressions(prompt);
        targetDays = resolvedDays;
        if (resolvedIntent) intent = resolvedIntent;

        // Class-specific detection
        const courseNames = enrollments.length > 0
          ? (await prisma.enrollment.findMany({ where: { userId: user.id }, include: { course: true } })).map(e => e.course.name.toLowerCase())
          : [];
        const matchedCourse = courseNames.find(name => lowerPrompt.includes(name));
        if (matchedCourse && (lowerPrompt.includes('skip') || lowerPrompt.includes('bunk') || lowerPrompt.includes('drop'))) {
          intent = 'skip_specific';
          targetClass = matchedCourse.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        } else if (!resolvedIntent) {
          intent = 'conversational';
          aiReply = "Hey — you've hit your agent usage limit for now, but don't panic. Your algorithmic engines are still fully active and can handle most of what you need. Tap **\"What can I do offline?\"** below to see everything that still works.";
        }
      }
    }

    // --- 2a. Help Offline Fast-Path ---
    if (intent === 'help_offline') {
      const helpContent = `**You've reached your agent usage limit** — but here's the good news: your core engines are still running at full power.

Think of it this way — the AI agents handle *conversations*, but the real heavy lifting (risk analysis, schedule optimization, constraint solving) is all done by dedicated **algorithmic and mathematical engines** that run independently. Those are fully active right now.

Here's exactly what you can still do:

---

**When you say a date, I know what you mean**

I understand how you naturally talk about time:
• "today" — I know it's ${currentDay}
• "tomorrow" — I'll resolve that to ${tomorrowDay}
• "this week" — I'll grab all remaining days through Friday
• "next Monday" — I'll calculate the exact date
• Or just say any day: "Monday", "Friday", etc.

---

**What you can ask me right now**

**→ "Skip tomorrow"** or **"Drop Friday"**
I'll run the constraint solver to check if you can safely miss that day without falling below 75%.

**→ "How many classes can I miss in a row?"**
I'll find the longest chain of consecutive classes you can skip while staying safe.

**→ "Maximize my time off"** or **"Optimize this week"**
I'll find every class you can safely drop this week to free up the most time possible.

**→ "Skip [Course Name]"** (e.g. "Skip Computer Algorithms")
I'll check your attendance for that specific subject and tell you if you have room.

**→ "Will this affect my grades?"**
I'll analyze the grade impact of your current plan.

---

**What's still working behind the scenes**

→ Risk simulation engine — runs 10,000 scenario simulations on your real data
→ Schedule optimizer — finds the mathematically safest skip combinations
→ Fatigue-aware planning — factors in your energy and sleep patterns
→ Strategy modes — Balanced, Exam Sprint, Survival, all still active
→ Your real attendance data — everything is pulled live from your records

**What's paused until the limit resets**

→ Free-form conversations (like "explain my situation")
→ Contextual follow-up questions
→ Personalized advice and detailed explanations

---

**Quick tip:** Just use the command suggestions below — they're designed to work perfectly without the AI agents. Type a short command like "skip Friday" and you'll get a full analysis instantly.`;

      return NextResponse.json({
        content: helpContent,
        action: 'info',
        isOffline: true,
        metrics: {
          newRuinProbability: currentRuinRisk,
          newSafeBunks: safeBunks,
          newStrategicSkips: safeBunks
        }
      });
    }

    // --- 2b. Conversational Fast-Path ---
    if (intent === 'conversational') {
      return NextResponse.json({
        content: aiReply,
        action: 'info',
        isOffline: !llmSuccess,
        metrics: {
          newRuinProbability: currentRuinRisk,
          newSafeBunks: safeBunks,
          newStrategicSkips: safeBunks
        }
      });
    }

    // --- 3. Constraint Solving ---
    const constraints: any[] = [{ type: intent, targetDays, targetClass }];
    const solverState = {
      schedule: currentSchedule || [],
      availableSafeBunks: safeBunks || 3,
      currentRuinRisk: currentRuinRisk || 12.5
    };

    // Fetch SAFTE fatigue data
    let sleepDebt = 0.0;
    let baselineFatigue = 0.0;
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { physicsProfile: true }
      });
      if (dbUser?.physicsProfile) {
        sleepDebt = dbUser.physicsProfile.sleepDebt;
        baselineFatigue = dbUser.physicsProfile.baselineFatigue;
      }
    } catch (profileErr) {
      console.warn("Could not fetch UserPhysicsProfile, using defaults.", profileErr);
    }

    // R1: Agent-specific threshold differentiation
    let dynamicTargetAttendance = 0.75; // Baseline (Compliance Agent default)
    if (agent === 'Tactical Negotiator') {
      // Aggressive: relaxed threshold, maximizes freed time
      dynamicTargetAttendance = strategy === 'Survival' || strategy === 'Burnout Recovery' ? 0.60 : 0.65;
    } else if (agent === 'Compliance Agent') {
      // Strict: enforce hardest threshold regardless of strategy
      dynamicTargetAttendance = 0.80;
    } else if (agent === 'Deliverable Agent') {
      // Deadline-aware: moderate threshold, adjusted by strategy
      dynamicTargetAttendance = strategy === 'Exam Sprint' ? 0.78 : 0.75;
    } else {
      // Fallback: strategy-driven thresholds
      if (strategy === 'Survival' || strategy === 'Burnout Recovery') dynamicTargetAttendance = 0.65;
      if (strategy === 'Placement Prep') dynamicTargetAttendance = 0.70;
    }

    const activeCurrentRisk = currentRuinRisk !== undefined ? currentRuinRisk : 12.5;

    let proposed;
    // Compliance Agent (conservative): If current risk > 20%, refuse skips.
    if (agent === 'Compliance Agent' && activeCurrentRisk > 20) {
      proposed = {
        classesToSkip: [],
        classesToAttend: currentSchedule.map((c: any) => c.id),
        freedHours: 0,
        newRuinRisk: activeCurrentRisk,
        reasoning: "Compliance Veto: Your current Risk Exposure exceeds the 20% safety threshold. No further reallocations can be approved. You must attend all remaining classes."
      };
    } else {
      try {
        const pythonSolverUrl = process.env.PYTHON_SOLVER_URL || 'http://127.0.0.1:8001/solve';
        const pyResponse = await fetch(pythonSolverUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schedule: solverState.schedule,
            availableSafeBunks: solverState.availableSafeBunks,
            currentRuinRisk: solverState.currentRuinRisk,
            constraints,
            sleepDebt,
            baselineFatigue,
            totalClasses: realTotalClasses,
            classesConducted: realClassesConducted,
            classesAttended: realClassesAttended,
            targetAttendance: dynamicTargetAttendance
          }),
          signal: AbortSignal.timeout(5000)
        });

        if (pyResponse.ok) {
          proposed = await pyResponse.json();
        } else {
          throw new Error(`Python solver returned status: ${pyResponse.status}`);
        }
      } catch (e) {
        console.warn("Python OR-Tools microservice unavailable or timed out. Falling back to native TS solver.", e);
        proposed = solveTimeConstraints(solverState, constraints);
        const mcResult = runMonteCarloSimulation({
          currentAttendance: realClassesConducted > 0 ? realClassesAttended / realClassesConducted : 1.0,
          targetAttendance: dynamicTargetAttendance,
          totalClasses: realTotalClasses,
          classesConducted: realClassesConducted + proposed.classesToSkip.length,
          classesAttended: realClassesAttended,
          iterations: 10000
        });
        proposed.newRuinRisk = mcResult.ruinProbability;
      }
    }

    // --- 4. Format Response ---
    const classesBeingSkipped = proposed.classesToSkip.length;
    const ruinProbability = proposed.newRuinRisk;
    let actionType = classesBeingSkipped > 0 ? 'accept_reject' : 'info';
    let textContent = '';

    // Compliance Agent (conservative): Warn strongly if risk > 15%
    let complianceWarning = '';
    if (agent === 'Compliance Agent' && activeCurrentRisk > 15) {
      complianceWarning = `\n\n⚠️ **COMPLIANCE ALERT**: Your current Risk Exposure is high at **${activeCurrentRisk}%**. Further skips are highly discouraged by compliance guidelines.`;
    }

    if (proposed.reasoning) {
      textContent = `${aiReply}\n\n**Optimization Results**\n\n${proposed.reasoning}\n\n> Estimated Risk After Skipping: **${ruinProbability}%**${complianceWarning}`;
    } else if (ruinProbability > 20) {
      if (targetDays.length === 0) {
        textContent = `${aiReply}\n\n⚠️ **CRITICAL RISK DETECTED**\n\nCramér-Lundberg simulations on your real attendance records show your Risk Exposure is **${ruinProbability}%**.\n\nAttend all remaining classes.${complianceWarning}`;
      } else {
        textContent = `${aiReply}\n\n⚠️ **CRITICAL RISK DETECTED**\n\nClearing ${targetDays.join(', ')} increases your Risk Exposure to **${ruinProbability}%**. I strongly advise against this.${complianceWarning}`;
      }
    } else {
      if (targetDays.length === 0) {
        textContent = `${aiReply}\n\n✅ **SAFE TO PROCEED**\n\nYour current Risk Exposure is ${ruinProbability}%, well within safe bounds.${complianceWarning}`;
      } else {
        textContent = `${aiReply}\n\n✅ **SAFE TO PROCEED**\n\nClearing ${targetDays.join(', ')} brings your Risk Exposure to ${ruinProbability}%, within your safe threshold.${complianceWarning}`;
      }
    }

    // Deterministic safe bunks calculation
    const requiredAttended = Math.ceil(dynamicTargetAttendance * realTotalClasses);
    const minFutureAttended = Math.max(0, requiredAttended - realClassesAttended);
    const classesRemaining = realTotalClasses - realClassesConducted;
    const safeBunksRemaining = Math.max(0, classesRemaining - minFutureAttended);
    let strategicSkips = safeBunksRemaining;
    if (ruinProbability > 20) {
      strategicSkips = Math.max(0, safeBunksRemaining - 1);
    }

    return NextResponse.json({
      content: textContent,
      action: actionType,
      isOffline: !llmSuccess,
      metrics: {
        newRuinProbability: ruinProbability,
        newSafeBunks: safeBunksRemaining,
        newStrategicSkips: strategicSkips
      },
      proposedSchedule: proposed
    });

  } catch (error) {
    console.error('Negotiator API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
