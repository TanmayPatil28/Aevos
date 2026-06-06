// ─── Command Registry ───────────────────────────────────────────────────────
// Every terminal command is a typed object with metadata + handler.

import { MAN_PAGES } from "./manPages";
import { TERMINAL_THEMES, ThemeName } from "./themes";

// ─── Types ──────────────────────────────────────────────────────────────────

export type CommandCategory =
  | "NAVIGATION"
  | "DATA"
  | "ANALYSIS"
  | "SANDBOX"
  | "VFS"
  | "JOBS"
  | "AI"
  | "META"
  | "EASTER_EGG";

export interface TerminalContext {
  // State
  usmState: any;
  // Router
  router: any;
  // Terminal actions
  addLine: (type: "command" | "output" | "error" | "success" | "system" | "markdown" | "jsx", text: string, node?: React.ReactNode) => void;
  addLineAnimated: (type: "command" | "output" | "error" | "success" | "system", text: string, delay?: number) => void;
  setHistory: React.Dispatch<React.SetStateAction<any[]>>;
  // Aliases
  aliases: Record<string, string>;
  setAliases: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  // Theme
  currentTheme: ThemeName;
  setCurrentTheme: (theme: ThemeName) => void;
  // Session
  sessionStartTime: number;
  commandHistory: string[];
  // V3 additions
  cwd: string;
  setCwd: (cwd: string) => void;
  vfs: any; // VirtualFileSystem
  jobs: Record<string, { status: "running" | "done" | "error", cmd: string }>;
  setJobs: React.Dispatch<React.SetStateAction<Record<string, { status: "running" | "done" | "error", cmd: string }>>>;
}

export interface TerminalCommand {
  name: string;
  category: CommandCategory;
  description: string;
  usage: string;
  handler: (args: string[], ctx: TerminalContext) => void;
}

// ─── Fortunes ───────────────────────────────────────────────────────────────

const FORTUNES = [
  "The only way to do great work is to love what you do. — Steve Jobs",
  "Education is the most powerful weapon you can use to change the world. — Nelson Mandela",
  "The expert in anything was once a beginner. — Helen Hayes",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. — Churchill",
  "The beautiful thing about learning is that no one can take it away from you. — B.B. King",
  "It does not matter how slowly you go as long as you do not stop. — Confucius",
  "An investment in knowledge pays the best interest. — Benjamin Franklin",
  "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice. — Brian Herbert",
  "Tell me and I forget, teach me and I may remember, involve me and I learn. — Benjamin Franklin",
  "Live as if you were to die tomorrow. Learn as if you were to live forever. — Mahatma Gandhi",
  "The roots of education are bitter, but the fruit is sweet. — Aristotle",
  "What we learn with pleasure we never forget. — Alfred Mercier",
  "I am still learning. — Michelangelo (at age 87)",
  "A person who never made a mistake never tried anything new. — Albert Einstein",
  "The more that you read, the more things you will know. The more that you learn, the more places you'll go. — Dr. Seuss",
  "You don't have to be great to start, but you have to start to be great. — Zig Ziglar",
  "Debugging is twice as hard as writing the code. — Brian Kernighan",
  "First, solve the problem. Then, write the code. — John Johnson",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. — Martin Fowler",
  "The function of education is to teach one to think intensively and critically. — MLK Jr.",
];

// ─── Route Map ──────────────────────────────────────────────────────────────

const ROUTE_MAP: Record<string, string> = {
  dashboard: "/dashboard",
  placement: "/placement",
  career: "/career",
  forecast: "/forecast",
  backlog: "/backlog",
  calculator: "/calculator",
  attendance: "/attendance",
  planner: "/planner",
  overview: "/overview",
  identity: "/identity",
  records: "/records",
  ledger: "/ledger",
  timeline: "/timeline",
  forecasting: "/forecasting",
};

const PANEL_MAP: Record<string, string> = {
  predictor: "PREDICTOR",
  strategy: "STRATEGY",
  backlog: "BACKLOG",
  interventions: "INTERVENTIONS",
};

// ─── Neofetch Generator ─────────────────────────────────────────────────────

export function generateNeofetch(ctx: TerminalContext): string[] {
  const s = ctx.usmState;
  const isSandbox = s.workspaceUi.mode === "SANDBOX";
  const cgpa = isSandbox ? s.workspaceUi.sandboxCgpa : s.academic.currentCgpa;
  const backlogs = isSandbox ? s.workspaceUi.sandboxBacklogs : s.academic.activeBacklogsCount;

  const totalAttended = s.courses.reduce(
    (sum: number, c: any) => sum + (c.attendanceTotal - c.attendanceBunked),
    0
  );
  const totalClasses = s.courses.reduce(
    (sum: number, c: any) => sum + c.attendanceTotal,
    0
  );
  const attendancePct = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

  const pad = (label: string, val: string | number) =>
    `  ${label} ${"·".repeat(Math.max(1, 18 - label.length))} ${val}`;

  return [
    "",
    "   ██████╗ ███████╗" + pad("CGPA", cgpa ?? 0),
    "  ██╔════╝ ██╔════╝" + pad("Backlogs", backlogs ?? 0),
    "  ██║  ███╗█████╗  " + pad("Semester", s.academic.completedSemesters),
    "  ██║   ██║██╔══╝  " + pad("Credits", s.academic.earnedCredits),
    "  ╚██████╔╝██║     " + pad("Attendance", `${attendancePct}%`),
    "   ╚═════╝ ╚═╝     " + pad("Mode", s.workspaceUi.mode),
    "                    " + pad("Target Role", s.career.targetRole || "—"),
    "  GradeFlow v0.1.0 " + pad("Skills", s.career.skills.length),
    "",
  ];
}

// ─── Cowsay Generator ───────────────────────────────────────────────────────

function cowsay(msg: string): string[] {
  const maxLen = Math.min(msg.length, 40);
  const border = "─".repeat(maxLen + 2);
  const words = msg.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur.length + w.length + 1 > maxLen) {
      lines.push(cur);
      cur = w;
    } else {
      cur = cur ? `${cur} ${w}` : w;
    }
  }
  if (cur) lines.push(cur);

  const result = [`  ┌${border}┐`];
  for (const l of lines) {
    result.push(`  │ ${l.padEnd(maxLen)} │`);
  }
  result.push(`  └${border}┘`);
  result.push("         \\   ^__^");
  result.push("          \\  (oo)\\_______");
  result.push("             (__)\\       )\\/\\");
  result.push("                 ||----w |");
  result.push("                 ||     ||");
  return result;
}

// ─── Command Definitions ────────────────────────────────────────────────────

export const COMMANDS: TerminalCommand[] = [
  // ── Navigation ──
  {
    name: "goto",
    category: "NAVIGATION",
    description: "Navigate to a GradeFlow page",
    usage: "goto <page>",
    handler: (args, ctx) => {
      const page = args[1]?.toLowerCase();
      if (!page) {
        ctx.addLine("error", "Usage: goto <page>  |  Available: " + Object.keys(ROUTE_MAP).join(", "));
        return;
      }
      const route = ROUTE_MAP[page];
      if (!route) {
        ctx.addLine("error", `Unknown page: ${page}. Available: ${Object.keys(ROUTE_MAP).join(", ")}`);
        return;
      }
      ctx.addLine("success", `Navigating to /${page}...`);
      setTimeout(() => ctx.router.push(route), 200);
    },
  },
  {
    name: "back",
    category: "NAVIGATION",
    description: "Go to the previous page",
    usage: "back",
    handler: (_args, ctx) => {
      ctx.addLine("output", "Navigating back...");
      setTimeout(() => ctx.router.back(), 200);
    },
  },
  {
    name: "home",
    category: "NAVIGATION",
    description: "Go to the landing page",
    usage: "home",
    handler: (_args, ctx) => {
      ctx.addLine("success", "Navigating to home...");
      setTimeout(() => ctx.router.push("/"), 200);
    },
  },
  {
    name: "open",
    category: "NAVIGATION",
    description: "Open a workspace panel",
    usage: "open <panel>",
    handler: (args, ctx) => {
      const panel = args[1]?.toLowerCase();
      if (!panel) {
        ctx.addLine("error", "Usage: open <panel>  |  Available: " + Object.keys(PANEL_MAP).join(", "));
        return;
      }
      const mapped = PANEL_MAP[panel];
      if (!mapped) {
        ctx.addLine("error", `Unknown panel: ${panel}. Available: ${Object.keys(PANEL_MAP).join(", ")}`);
        return;
      }
      ctx.usmState.openPanel(mapped);
      ctx.addLine("success", `Panel opened: ${panel}`);
    },
  },

  // ── Data Reads ──
  {
    name: "whoami",
    category: "DATA",
    description: "Display current academic and career metrics",
    usage: "whoami",
    handler: (_args, ctx) => {
      const s = ctx.usmState;
      const isSandbox = s.workspaceUi.mode === "SANDBOX";
      if (isSandbox) ctx.addLine("error", "[WARNING] SHOWING SANDBOX METRICS");
      const cgpa = isSandbox ? s.workspaceUi.sandboxCgpa : s.academic.currentCgpa;
      const backlogs = isSandbox ? s.workspaceUi.sandboxBacklogs : s.academic.activeBacklogsCount;
      ctx.addLine("output", `CGPA: ${cgpa}`);
      ctx.addLine("output", `Active Backlogs: ${backlogs}`);
      ctx.addLine("output", `Target Role: ${s.career.targetRole || "None"}`);
      ctx.addLine("output", `Skills (${s.career.skills.length}): ${s.career.skills.join(", ") || "None"}`);
    },
  },
  {
    name: "status",
    category: "DATA",
    description: "Quick one-line status",
    usage: "status",
    handler: (_args, ctx) => {
      const s = ctx.usmState;
      const isSandbox = s.workspaceUi.mode === "SANDBOX";
      const cgpa = isSandbox ? s.workspaceUi.sandboxCgpa : s.academic.currentCgpa;
      const backlogs = isSandbox ? s.workspaceUi.sandboxBacklogs : s.academic.activeBacklogsCount;
      ctx.addLine("output", `CGPA: ${cgpa}  |  Backlogs: ${backlogs}  |  Mode: ${s.workspaceUi.mode}  |  Sem: ${s.academic.completedSemesters}`);
    },
  },
  {
    name: "neofetch",
    category: "DATA",
    description: "ASCII art system info dashboard",
    usage: "neofetch",
    handler: (_args, ctx) => {
      const lines = generateNeofetch(ctx);
      for (const line of lines) {
        ctx.addLineAnimated("system", line, 30);
      }
    },
  },
  {
    name: "ls",
    category: "DATA",
    description: "List academic data",
    usage: "ls subjects | ls backlogs",
    handler: (args, ctx) => {
      const sub = args[1]?.toLowerCase();
      const courses = ctx.usmState.courses as any[];

      if (sub === "subjects") {
        if (courses.length === 0) {
          ctx.addLine("output", "No courses found.");
          return;
        }
        ctx.addLine("output", " CODE     | CREDITS | GRADE | CIE  | NAME");
        ctx.addLine("output", "─────────┼─────────┼───────┼──────┼" + "─".repeat(30));
        for (const c of courses) {
          ctx.addLine(
            "output",
            ` ${(c.code || "—").padEnd(8)} | ${String(c.credits).padEnd(7)} | ${(c.grade || "—").padEnd(5)} | ${String(c.cieMarks).padEnd(4)} | ${c.name}`
          );
        }
      } else if (sub === "backlogs") {
        const bklogs = courses.filter((c: any) => c.grade === "F" || c.grade === "FAIL" || c.grade === "Ab");
        if (bklogs.length === 0) {
          ctx.addLine("success", "No active backlogs. You're clear.");
          return;
        }
        ctx.addLine("error", `${bklogs.length} active backlog(s):`);
        for (const c of bklogs) {
          ctx.addLine("error", `  [${c.code}] ${c.name} (Sem ${c.semester})`);
        }
      } else {
        ctx.addLine("error", "Usage: ls subjects | ls backlogs");
      }
    },
  },
  {
    name: "cat",
    category: "DATA",
    description: "Show details for a course",
    usage: "cat <course_code>",
    handler: (args, ctx) => {
      const code = args[1]?.toUpperCase();
      if (!code) {
        ctx.addLine("error", "Usage: cat <course_code>");
        return;
      }
      // If it's a VFS file
      if (ctx.vfs) {
         const res = ctx.vfs.read(ctx.cwd, args[1]);
         if (!res.error && res.content !== undefined) {
             ctx.addLine("output", res.content);
             return;
         }
      }
      
      const courses = ctx.usmState.courses as any[];
      const course = courses.find(
        (c: any) => c.code?.toUpperCase() === code || c.name?.toLowerCase().includes(code.toLowerCase())
      );
      if (!course) {
        ctx.addLine("error", `Course not found and file not found: ${args[1]}`);
        return;
      }
      const attended = course.attendanceTotal - course.attendanceBunked;
      const pct = course.attendanceTotal > 0 ? Math.round((attended / course.attendanceTotal) * 100) : 0;
      ctx.addLine("output", `═══ ${course.code}: ${course.name} ═══`);
      ctx.addLine("output", `  Semester:   ${course.semester}`);
      ctx.addLine("output", `  Credits:    ${course.credits}`);
      ctx.addLine("output", `  Grade:      ${course.grade || "Pending"}`);
      ctx.addLine("output", `  CIE Marks:  ${course.cieMarks}`);
      ctx.addLine("output", `  SEE Marks:  ${course.seeMarks ?? "—"}`);
      ctx.addLine("output", `  Attendance: ${attended}/${course.attendanceTotal} (${pct}%)`);
    },
  },

  // ── VFS ──
  {
    name: "pwd",
    category: "VFS",
    description: "Print working directory",
    usage: "pwd",
    handler: (_args, ctx) => {
      ctx.addLine("output", ctx.cwd);
    },
  },
  {
    name: "cd",
    category: "VFS",
    description: "Change directory",
    usage: "cd <path>",
    handler: (args, ctx) => {
      const p = args[1] || "/";
      if (!ctx.vfs) return;
      const resolved = ctx.vfs.resolvePath(ctx.cwd, p);
      const node = ctx.vfs.getNode(resolved);
      if (!node) {
         ctx.addLine("error", `cd: no such file or directory: ${p}`);
      } else if (node.type !== "dir") {
         ctx.addLine("error", `cd: not a directory: ${p}`);
      } else {
         ctx.setCwd("/" + resolved.join("/"));
      }
    },
  },
  {
    name: "mkdir",
    category: "VFS",
    description: "Make directory",
    usage: "mkdir <name>",
    handler: (args, ctx) => {
      if (!args[1]) return ctx.addLine("error", "Usage: mkdir <name>");
      const err = ctx.vfs?.mkdir(ctx.cwd, args[1]);
      if (err) ctx.addLine("error", `mkdir: ${err}`);
    },
  },
  {
    name: "touch",
    category: "VFS",
    description: "Create empty file",
    usage: "touch <name>",
    handler: (args, ctx) => {
      if (!args[1]) return ctx.addLine("error", "Usage: touch <name>");
      const err = ctx.vfs?.touch(ctx.cwd, args[1]);
      if (err) ctx.addLine("error", `touch: ${err}`);
    },
  },
  {
    name: "rm",
    category: "VFS",
    description: "Remove file or directory",
    usage: "rm <name>",
    handler: (args, ctx) => {
      if (!args[1]) return ctx.addLine("error", "Usage: rm <name>");
      const err = ctx.vfs?.rm(ctx.cwd, args[1]);
      if (err) ctx.addLine("error", `rm: ${err}`);
    },
  },
  {
    name: "echo",
    category: "VFS",
    description: "Print text or write to file",
    usage: "echo <text> [> file]",
    handler: (args, ctx) => {
      const full = args.slice(1).join(" ");
      const redirMatch = full.split(" > ");
      if (redirMatch.length > 1) {
         const text = redirMatch[0].replace(/^"|"$/g, '').replace(/^'|'$/g, '');
         const file = redirMatch[1].trim();
         const err = ctx.vfs?.write(ctx.cwd, file, text);
         if (err) ctx.addLine("error", `echo: ${err}`);
      } else {
         ctx.addLine("output", full.replace(/^"|"$/g, '').replace(/^'|'$/g, ''));
      }
    },
  },
  
  // ── AI ──
  {
    name: "ai",
    category: "AI",
    description: "Ask Gemini AI a question",
    usage: 'ai "<question>"',
    handler: async (args, ctx) => {
       const prompt = args.slice(1).join(" ");
       if (!prompt) return ctx.addLine("error", 'Usage: ai "<question>"');
       
       const lineId = Math.random().toString(36).substr(2, 9);
       ctx.setHistory((prev) => [
         ...prev,
         { id: lineId, type: "markdown", text: "", isStreaming: true }
       ]);
       
       try {
           let aiHistory = [];
           try {
             aiHistory = JSON.parse(localStorage.getItem("gradeflow_ai_history") || "[]");
           } catch(e) {}
           
           const res = await fetch("/api/terminal/ai", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                   prompt,
                   context: {
                       cgpa: ctx.usmState.workspaceUi.mode === "SANDBOX" ? ctx.usmState.workspaceUi.sandboxCgpa : ctx.usmState.academic.currentCgpa,
                       backlogs: ctx.usmState.workspaceUi.mode === "SANDBOX" ? ctx.usmState.workspaceUi.sandboxBacklogs : ctx.usmState.academic.activeBacklogsCount,
                       skills: ctx.usmState.career.skills,
                       targetRole: ctx.usmState.career.targetRole,
                       courses: ctx.usmState.courses,
                       cwd: ctx.cwd,
                       jobs: ctx.jobs,
                       route: window.location.pathname,
                       history: ctx.commandHistory.slice(0, 5),
                       aiHistory
                   }
               })
           });
           
           if (!res.ok) {
               const err = await res.text();
               ctx.setHistory((prev) => prev.map(l => l.id === lineId ? { ...l, text: `AI Error: ${err}`, type: "error", isStreaming: false } : l));
               return;
           }
           
           if (!res.body) throw new Error("No response body");
           
           const reader = res.body.getReader();
           const decoder = new TextDecoder("utf-8");
           let done = false;
           let fullResponse = "";
           
           while (!done) {
               const { value, done: readerDone } = await reader.read();
               done = readerDone;
               if (value) {
                   const chunk = decoder.decode(value, { stream: true });
                   fullResponse += chunk;
                   ctx.setHistory((prev) => prev.map(l => l.id === lineId ? { ...l, text: fullResponse } : l));
                   window.dispatchEvent(new Event('gradeflow-typing-sfx'));
               }
           }
           
           ctx.setHistory((prev) => prev.map(l => l.id === lineId ? { ...l, isStreaming: false } : l));
           
           // Update history
           aiHistory.push({ role: "user", text: prompt });
           aiHistory.push({ role: "model", text: fullResponse });
           if (aiHistory.length > 20) aiHistory = aiHistory.slice(aiHistory.length - 20); // Keep last 10 turns
           localStorage.setItem("gradeflow_ai_history", JSON.stringify(aiHistory));
           
       } catch(e: any) {
           ctx.setHistory((prev) => prev.map(l => l.id === lineId ? { ...l, text: `AI Request failed: ${e.message}`, type: "error", isStreaming: false } : l));
       }
    }
  },

  // ── JOBS ──
  {
    name: "jobs",
    category: "JOBS",
    description: "List background jobs",
    usage: "jobs",
    handler: (_args, ctx) => {
      const keys = Object.keys(ctx.jobs);
      if (keys.length === 0) {
         ctx.addLine("output", "No background jobs.");
         return;
      }
      for (const k of keys) {
         const j = ctx.jobs[k];
         const color = j.status === "running" ? "output" : j.status === "done" ? "success" : "error";
         ctx.addLine(color as any, `[${k}] ${j.status.padEnd(8)} ${j.cmd}`);
      }
    },
  },
  
  // ── META EXT ──
  {
    name: "eval",
    category: "META",
    description: "Evaluate sandboxed JS",
    usage: 'eval "<code>"',
    handler: (args, ctx) => {
       const code = args.slice(1).join(" ");
       try {
          const fn = new Function("ctx", `return (${code})`);
          const res = fn(ctx);
          ctx.addLine("output", String(res));
       } catch(e: any) {
          ctx.addLine("error", `Eval error: ${e.message}`);
       }
    }
  },

  // ── Analysis ──
  {
    name: "analyze",
    category: "ANALYSIS",
    description: "Run diagnostic analysis",
    usage: "analyze --profile | --risk | --attendance",
    handler: (args, ctx) => {
      const flag = args[1];
      const s = ctx.usmState;
      const isSandbox = s.workspaceUi.mode === "SANDBOX";
      const cgpa = (isSandbox ? s.workspaceUi.sandboxCgpa : s.academic.currentCgpa) || 0;
      const backlogs = (isSandbox ? s.workspaceUi.sandboxBacklogs : s.academic.activeBacklogsCount) || 0;

      if (flag === "--profile") {
        ctx.addLineAnimated("output", "Analyzing profile parameters...", 20);
        setTimeout(() => {
          if (cgpa >= 8.5) ctx.addLine("success", "[OK] CGPA is optimal for Product/FAANG tiers.");
          else if (cgpa >= 7.0) ctx.addLine("output", "[WARN] CGPA sufficient for Service, borderline Product.");
          else ctx.addLine("error", "[CRITICAL] CGPA below safety threshold. Optimization required.");

          if (backlogs > 0) ctx.addLine("error", `[CRITICAL] ${backlogs} active backlog(s). Immediate clearance required.`);
          else ctx.addLine("success", "[OK] Zero active backlogs.");

          if (s.career.skills.length === 0) ctx.addLine("error", "[WARN] No skills registered. Career module empty.");
          else if (s.career.skills.length < 3) ctx.addLine("output", `[WARN] Only ${s.career.skills.length} skills. Consider expanding.`);
          else ctx.addLine("success", `[OK] ${s.career.skills.length} skills registered.`);
        }, 600);
      } else if (flag === "--risk") {
        ctx.addLineAnimated("output", "Calculating risk vectors...", 20);
        setTimeout(() => {
          ctx.addLine(cgpa >= 7.0 ? "success" : "error", `  CGPA Risk:       ${cgpa >= 8.0 ? "LOW" : cgpa >= 7.0 ? "MEDIUM" : "HIGH"}`);
          ctx.addLine(backlogs === 0 ? "success" : "error", `  Backlog Risk:    ${backlogs === 0 ? "LOW" : backlogs <= 2 ? "MEDIUM" : "HIGH"}`);
          ctx.addLine("output", `  Placement Risk:  ${cgpa >= 7.5 && backlogs === 0 ? "LOW" : "ELEVATED"}`);
        }, 600);
      } else if (flag === "--attendance") {
        ctx.addLine("output", "Attendance per subject:");
        const courses = s.courses as any[];
        if (courses.length === 0) {
          ctx.addLine("output", "  No courses found.");
          return;
        }
        for (const c of courses) {
          const attended = c.attendanceTotal - c.attendanceBunked;
          const pct = c.attendanceTotal > 0 ? Math.round((attended / c.attendanceTotal) * 100) : 0;
          const status = pct >= 75 ? "success" : pct >= 65 ? "output" : "error";
          ctx.addLine(status as any, `  [${c.code}] ${pct}% (${attended}/${c.attendanceTotal})`);
        }
      } else {
        ctx.addLine("error", "Usage: analyze --profile | --risk | --attendance");
      }
    },
  },

  // ── Sandbox ──
  {
    name: "sandbox",
    category: "SANDBOX",
    description: "Enter/exit simulation mode",
    usage: "sandbox enter | exit",
    handler: (args, ctx) => {
      if (args[1] === "enter") {
        ctx.usmState.setWorkspaceMode("SANDBOX");
        ctx.usmState.setSandboxMetrics(ctx.usmState.academic.currentCgpa, ctx.usmState.academic.activeBacklogsCount);
        ctx.addLine("error", "[WARNING] ENTERING SANDBOX MODE. REALITY OVERRIDE ENABLED.");
      } else if (args[1] === "exit") {
        ctx.usmState.setWorkspaceMode("DEFAULT");
        ctx.addLine("success", "[OK] EXITED SANDBOX MODE. RESTORING REALITY.");
      } else {
        ctx.addLine("error", "Usage: sandbox enter | exit");
      }
    },
  },
  {
    name: "set",
    category: "SANDBOX",
    description: "Override sandbox metrics",
    usage: "set cgpa <v> | set backlogs <v>",
    handler: (args, ctx) => {
      if (ctx.usmState.workspaceUi.mode !== "SANDBOX") {
        ctx.addLine("error", "[DENIED] Cannot set metrics outside sandbox mode. Type 'sandbox enter' first.");
        return;
      }
      if (args[1] === "cgpa" && args[2]) {
        const val = parseFloat(args[2]);
        if (!isNaN(val) && val >= 0 && val <= 10) {
          ctx.usmState.setSandboxMetrics(val, ctx.usmState.workspaceUi.sandboxBacklogs);
          ctx.addLine("success", `[SANDBOX] CGPA set to ${val}`);
        } else {
          ctx.addLine("error", "Invalid CGPA value. Must be 0-10.");
        }
      } else if (args[1] === "backlogs" && args[2]) {
        const val = parseInt(args[2]);
        if (!isNaN(val) && val >= 0) {
          ctx.usmState.setSandboxMetrics(ctx.usmState.workspaceUi.sandboxCgpa, val);
          ctx.addLine("success", `[SANDBOX] Backlogs set to ${val}`);
        } else {
          ctx.addLine("error", "Invalid backlogs value.");
        }
      } else {
        ctx.addLine("error", "Usage: set cgpa <val> | set backlogs <val>");
      }
    },
  },

  // ── Meta ──
  {
    name: "help",
    category: "META",
    description: "List all commands",
    usage: "help",
    handler: (_args, ctx) => {
      const categories: Record<string, TerminalCommand[]> = {};
      for (const cmd of COMMANDS) {
        if (!categories[cmd.category]) categories[cmd.category] = [];
        categories[cmd.category].push(cmd);
      }
      const order: CommandCategory[] = ["NAVIGATION", "DATA", "ANALYSIS", "SANDBOX", "META", "EASTER_EGG"];
      const labels: Record<string, string> = {
        NAVIGATION: "🧭 NAVIGATION",
        DATA: "📊 DATA",
        ANALYSIS: "🔬 ANALYSIS",
        SANDBOX: "🧪 SANDBOX",
        META: "⚙️  META",
        EASTER_EGG: "🥚 EASTER EGGS",
      };
      for (const cat of order) {
        const cmds = categories[cat];
        if (!cmds) continue;
        ctx.addLine("output", "");
        ctx.addLine("system", labels[cat] || cat);
        for (const c of cmds) {
          ctx.addLine("output", `  ${c.usage.padEnd(24)} ${c.description}`);
        }
      }
      ctx.addLine("output", "");
      ctx.addLine("system", "Tip: Use 'man <cmd>' for detailed info. Ctrl+` to toggle. Tab to autocomplete.");
    },
  },
  {
    name: "man",
    category: "META",
    description: "Display command manual",
    usage: "man <command>",
    handler: (args, ctx) => {
      const cmd = args[1]?.toLowerCase();
      if (!cmd) {
        ctx.addLine("error", "Usage: man <command>");
        return;
      }
      const page = MAN_PAGES[cmd];
      if (!page) {
        ctx.addLine("error", `No manual entry for '${cmd}'.`);
        return;
      }
      for (const line of page) {
        ctx.addLine("output", line);
      }
    },
  },
  {
    name: "clear",
    category: "META",
    description: "Clear terminal",
    usage: "clear",
    handler: (_args, ctx) => {
      ctx.setHistory([]);
    },
  },
  {
    name: "alias",
    category: "META",
    description: "Create command shortcut",
    usage: "alias <name>=<cmd>",
    handler: (args, ctx) => {
      // Parse: alias gp=goto placement
      const raw = args.slice(1).join(" ");
      const eqIdx = raw.indexOf("=");
      if (eqIdx === -1) {
        ctx.addLine("error", "Usage: alias <name>=<command>  (e.g. alias gp=goto placement)");
        return;
      }
      const name = raw.slice(0, eqIdx).trim();
      const value = raw.slice(eqIdx + 1).trim();
      if (!name || !value) {
        ctx.addLine("error", "Usage: alias <name>=<command>");
        return;
      }
      ctx.setAliases((prev) => ({ ...prev, [name]: value }));
      ctx.addLine("success", `Alias created: ${name} → ${value}`);
    },
  },
  {
    name: "unalias",
    category: "META",
    description: "Remove command shortcut",
    usage: "unalias <name>",
    handler: (args, ctx) => {
      const name = args[1];
      if (!name) {
        ctx.addLine("error", "Usage: unalias <name>");
        return;
      }
      if (!ctx.aliases[name]) {
        ctx.addLine("error", `Alias not found: ${name}`);
        return;
      }
      ctx.setAliases((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
      ctx.addLine("success", `Alias removed: ${name}`);
    },
  },
  {
    name: "aliases",
    category: "META",
    description: "List all shortcuts",
    usage: "aliases",
    handler: (_args, ctx) => {
      const entries = Object.entries(ctx.aliases);
      if (entries.length === 0) {
        ctx.addLine("output", "No aliases defined. Use 'alias <name>=<cmd>' to create one.");
        return;
      }
      ctx.addLine("output", "DEFINED ALIASES:");
      for (const [k, v] of entries) {
        ctx.addLine("output", `  ${k} → ${v}`);
      }
    },
  },
  {
    name: "theme",
    category: "META",
    description: "Change terminal theme",
    usage: "theme <name>",
    handler: (args, ctx) => {
      const name = args[1]?.toLowerCase();
      if (!name) {
        ctx.addLine("error", "Usage: theme <name>  |  Available: " + Object.keys(TERMINAL_THEMES).join(", "));
        return;
      }
      if (!TERMINAL_THEMES[name]) {
        ctx.addLine("error", `Unknown theme: ${name}. Available: ${Object.keys(TERMINAL_THEMES).join(", ")}`);
        return;
      }
      ctx.setCurrentTheme(name as ThemeName);
      ctx.addLine("success", `Theme changed to: ${TERMINAL_THEMES[name].label}`);
    },
  },
  {
    name: "history",
    category: "META",
    description: "Show command history",
    usage: "history",
    handler: (_args, ctx) => {
      if (ctx.commandHistory.length === 0) {
        ctx.addLine("output", "No commands in history.");
        return;
      }
      const reversed = [...ctx.commandHistory].reverse();
      for (let i = 0; i < reversed.length; i++) {
        ctx.addLine("output", `  ${String(i + 1).padStart(4)}  ${reversed[i]}`);
      }
    },
  },
  {
    name: "export",
    category: "META",
    description: "Export terminal session",
    usage: "export session",
    handler: (args, ctx) => {
      if (args[1] !== "session") {
        ctx.addLine("error", "Usage: export session");
        return;
      }
      // We'll copy the current session to clipboard by serializing the history
      ctx.addLine("output", "Exporting session to clipboard...");
      // The actual clipboard write happens in the component since we need history state
      setTimeout(() => {
        ctx.addLine("success", "[OK] Session copied to clipboard.");
      }, 300);
    },
  },
  {
    name: "uptime",
    category: "META",
    description: "Session duration",
    usage: "uptime",
    handler: (_args, ctx) => {
      const elapsed = Date.now() - ctx.sessionStartTime;
      const seconds = Math.floor(elapsed / 1000) % 60;
      const minutes = Math.floor(elapsed / 60000) % 60;
      const hours = Math.floor(elapsed / 3600000);
      const parts: string[] = [];
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);
      ctx.addLine("output", `Session uptime: ${parts.join(" ")}`);
    },
  },

  // ── Easter Eggs ──
  {
    name: "sudo",
    category: "EASTER_EGG",
    description: "[RESTRICTED]",
    usage: "sudo hack grades",
    handler: (args, ctx) => {
      if (args.slice(1).join(" ") === "hack grades") {
        ctx.addLineAnimated("output", "Initiating university mainframe bypass...", 25);
        setTimeout(() => {
          ctx.addLineAnimated("output", "Injecting payload...", 30);
          setTimeout(() => {
            ctx.addLine("error", "CONNECTION TERMINATED. UNAUTHORIZED ACCESS ATTEMPT LOGGED. DISPATCHING CAMPUS SECURITY.");
          }, 800);
        }, 600);
      } else {
        ctx.addLine("error", "User is not in the sudoers file. This incident will be reported.");
      }
    },
  },
  {
    name: "matrix",
    category: "EASTER_EGG",
    description: "Digital rain animation",
    usage: "matrix",
    handler: (_args, ctx) => {
      ctx.addLine("success", "Entering the Matrix...");
      const chars = "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ01234567890ABCDEFZ";
      const makeRainLine = () => {
        let line = "";
        for (let i = 0; i < 60; i++) {
          line += Math.random() > 0.7 ? chars[Math.floor(Math.random() * chars.length)] : " ";
        }
        return line;
      };
      let count = 0;
      const interval = setInterval(() => {
        ctx.addLine("success", makeRainLine());
        count++;
        if (count >= 15) {
          clearInterval(interval);
          ctx.addLine("system", "[Matrix sequence complete. Welcome back.]");
        }
      }, 120);
    },
  },
  {
    name: "cowsay",
    category: "EASTER_EGG",
    description: "ASCII cow with message",
    usage: "cowsay <message>",
    handler: (args, ctx) => {
      const msg = args.slice(1).join(" ") || "moo";
      const lines = cowsay(msg);
      for (const line of lines) {
        ctx.addLine("output", line);
      }
    },
  },
  {
    name: "fortune",
    category: "EASTER_EGG",
    description: "Random motivational quote",
    usage: "fortune",
    handler: (_args, ctx) => {
      const quote = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
      ctx.addLine("output", "");
      ctx.addLine("system", `  "${quote}"`);
      ctx.addLine("output", "");
    },
  },
];

// ─── Lookup Helpers ─────────────────────────────────────────────────────────

export function findCommand(name: string): TerminalCommand | undefined {
  return COMMANDS.find((c) => c.name === name);
}

export function getAllCommandNames(): string[] {
  return COMMANDS.map((c) => c.name);
}

export interface AutocompleteSuggestion {
  text: string;
  description?: string;
  type?: "command" | "flag" | "path" | "alias";
}

export function getCompletions(): AutocompleteSuggestion[] {
  const completions: AutocompleteSuggestion[] = [];
  for (const cmd of COMMANDS) {
    completions.push({ text: cmd.name, description: cmd.description, type: "command" });
  }
  
  // Add common full commands for better tab completion
  const commonCommands = [
    { text: "analyze --profile", description: "Run full profile analysis", type: "flag" as const },
    { text: "analyze --risk", description: "Identify academic risks", type: "flag" as const },
    { text: "analyze --attendance", description: "Check attendance status", type: "flag" as const },
    { text: "sandbox enter", description: "Enter simulated environment", type: "command" as const },
    { text: "sandbox exit", description: "Exit simulated environment", type: "command" as const },
    { text: "set cgpa", description: "Set target CGPA", type: "command" as const },
    { text: "set backlogs", description: "Set target backlogs limit", type: "command" as const },
    { text: "ls subjects", description: "List current subjects", type: "command" as const },
    { text: "ls backlogs", description: "List current backlogs", type: "command" as const },
    { text: "sudo hack grades", description: "[RESTRICTED]", type: "command" as const },
    { text: "export session", description: "Export terminal session", type: "command" as const },
  ];
  completions.push(...commonCommands);

  Object.keys(ROUTE_MAP).forEach((r) => {
    completions.push({ text: `goto ${r}`, description: `Navigate to /${r}`, type: "command" });
  });
  
  Object.keys(PANEL_MAP).forEach((p) => {
    completions.push({ text: `open ${p}`, description: `Open ${p} panel`, type: "command" });
  });

  return completions;
}
