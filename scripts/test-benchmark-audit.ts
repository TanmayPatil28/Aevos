import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface SolverResponse {
  classesToSkip: string[];
  classesToAttend: string[];
  freedHours: number;
  newRuinRisk: number;
  reasoning: string;
}

function spawnSolver(cmd: string): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, ['engine/solver.py'], {
      cwd: process.cwd()
    });

    proc.stdout?.on('data', (data) => {
      console.log(`[Solver] ${data.toString().trim()}`);
    });
    proc.stderr?.on('data', (data) => {
      console.error(`[Solver Error] ${data.toString().trim()}`);
    });

    let resolved = false;

    const errorHandler = (err: Error & { code?: string }) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        reject(err);
      }
    };

    proc.on('error', errorHandler);

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        proc.off('error', errorHandler);
        resolve(proc);
      }
    }, 100);
  });
}

async function startSolver(): Promise<ChildProcess> {
  const commands = ['py', 'python3', 'python'];
  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    try {
      console.log(`Attempting to spawn solver with: ${cmd}`);
      const proc = await spawnSolver(cmd);
      return proc;
    } catch (err) {
      console.log(`Failed to spawn solver with ${cmd}:`, err instanceof Error ? err.message : String(err));
      if (i === commands.length - 1) {
        throw err;
      }
    }
  }
  throw new Error("No python executable could spawn engine/solver.py");
}

async function main() {
  console.log("=== GradeFlow Benchmark Audit ===");

  // 1. Programmatically parse and check prisma/schema.prisma
  console.log("Checking prisma/schema.prisma...");
  try {
    const prismaSchemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    if (!fs.existsSync(prismaSchemaPath)) {
      throw new Error(`Prisma schema not found at ${prismaSchemaPath}`);
    }
    const content = fs.readFileSync(prismaSchemaPath, 'utf-8');

    // Strip single-line comments (starting with //)
    const lines = content.split('\n');
    const cleanLines = lines.map(line => {
      const commentIndex = line.indexOf('//');
      if (commentIndex !== -1) {
        return line.substring(0, commentIndex);
      }
      return line;
    });
    const cleanContent = cleanLines.join('\n');

    // Extract model block for UserPhysicsProfile
    const modelRegex = /model\s+UserPhysicsProfile\s*{([^}]*)}/;
    const match = cleanContent.match(modelRegex);
    if (!match) {
      throw new Error('Model UserPhysicsProfile not found in schema.prisma');
    }
    const modelBody = match[1];

    // Verify fields exist
    const fieldsToCheck = ['circadianRhythm', 'sleepDebt', 'baselineFatigue'];
    for (const field of fieldsToCheck) {
      const regex = new RegExp(`\\b${field}\\b`);
      if (!regex.test(modelBody)) {
        throw new Error(`Field ${field} is missing in UserPhysicsProfile model`);
      }

      // Check if it is mandatory (i.e. not optional - no '?' mark)
      const fieldTypeMatch = modelBody.match(new RegExp(`\\b${field}\\s+(\\w+)\\??`));
      if (!fieldTypeMatch) {
        throw new Error(`Could not parse ${field} field type`);
      }
      if (fieldTypeMatch[0].includes('?')) {
        throw new Error(`${field} must be a mandatory field (found optional '?')`);
      }
    }
    console.log("✅ Prisma schema checks passed.");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("❌ Prisma schema check failed:", message);
    process.exit(1);
  }

  // 2. Spawn engine/solver.py on port 8001
  console.log("Spawning FastAPI solver...");
  let solverProcess: ChildProcess | null = null;
  try {
    solverProcess = await startSolver();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("❌ Failed to start FastAPI solver:", message);
    process.exit(1);
  }

  let killed = false;
  const killSolver = () => {
    if (!killed) {
      console.log("Stopping FastAPI solver process...");
      try {
        if (solverProcess) {
          solverProcess.kill();
        }
      } catch (e) {
        console.error("Error killing process:", e);
      }
      killed = true;
    }
  };

  // Register clean up hooks
  process.on('exit', killSolver);
  process.on('SIGINT', () => { killSolver(); process.exit(1); });
  process.on('SIGTERM', () => { killSolver(); process.exit(1); });

  // 3. Poll health of http://127.0.0.1:8001/openapi.json
  const healthUrl = "http://127.0.0.1:8001/openapi.json";
  console.log(`Polling solver health at ${healthUrl} for up to 10 seconds...`);
  
  let healthy = false;
  const startPoll = Date.now();
  while (Date.now() - startPoll < 10000) {
    try {
      const response = await fetch(healthUrl, { signal: AbortSignal.timeout(2000) });
      if (response.ok) {
        healthy = true;
        break;
      }
    } catch {
      // ignore connection errors during polling
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  if (!healthy) {
    console.error("❌ FastAPI solver failed to start within 10 seconds.");
    killSolver();
    process.exit(1);
  }
  console.log("✅ FastAPI solver is healthy.");

  // 4. Send a valid CP-SAT optimization payload to http://127.0.0.1:8001/solve (POST)
  const solveUrl = "http://127.0.0.1:8001/solve";
  const payload = {
    schedule: [
      {
        id: "session_1",
        courseCode: "CS101",
        title: "Introduction to CS",
        type: "lecture",
        dayOfWeek: "Monday",
        startTime: "09:00",
        endTime: "10:00",
        isMandatory: false,
        penaltyWeight: 0.5
      },
      {
        id: "session_2",
        courseCode: "CS102",
        title: "CS Lab",
        type: "lab",
        dayOfWeek: "Tuesday",
        startTime: "10:00",
        endTime: "12:00",
        isMandatory: true,
        penaltyWeight: 1.0
      }
    ],
    availableSafeBunks: 1,
    currentRuinRisk: 0.1,
    constraints: []
  };

  console.log("Sending optimization request to /solve...");
  try {
    const res = await fetch(solveUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000)
    });

    if (res.status !== 200) {
      throw new Error(`Expected HTTP 200, got status ${res.status}`);
    }

    const responseData = await res.json() as SolverResponse;
    console.log("Received response from solver:", JSON.stringify(responseData, null, 2));

    // Assert that the response is mathematically structured JSON
    const requiredKeys: (keyof SolverResponse)[] = ['classesToSkip', 'classesToAttend', 'freedHours', 'newRuinRisk', 'reasoning'];
    for (const key of requiredKeys) {
      if (!(key in responseData)) {
        throw new Error(`Response missing required key: ${key}`);
      }
    }

    if (!Array.isArray(responseData.classesToSkip) || !Array.isArray(responseData.classesToAttend)) {
      throw new Error('classesToSkip and classesToAttend must be arrays');
    }
    if (typeof responseData.freedHours !== 'number') {
      throw new Error('freedHours must be a number');
    }
    if (typeof responseData.newRuinRisk !== 'number') {
      throw new Error('newRuinRisk must be a number');
    }
    if (typeof responseData.reasoning !== 'string') {
      throw new Error('reasoning must be a string');
    }

    // Verify expected output values
    if (!responseData.classesToSkip.includes('session_1')) {
      throw new Error("Expected 'session_1' to be in classesToSkip");
    }
    if (!responseData.classesToAttend.includes('session_2')) {
      throw new Error("Expected 'session_2' to be in classesToAttend");
    }

    console.log("✅ Solver optimization asserts passed successfully.");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("❌ Solver assertion check failed:", message);
    killSolver();
    process.exit(1);
  }

  // 5. Clean up and exit
  killSolver();
  console.log("=== All Benchmark Audits Passed successfully ===");
  process.exit(0);
}

main().catch((err) => {
  console.error("Unhandled error in main:", err);
  process.exit(1);
});
