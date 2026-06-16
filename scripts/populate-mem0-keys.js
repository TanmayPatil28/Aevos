const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

function getStorePath() {
  const storePathEnv = process.env.MEM0_STORE_PATH;
  if (storePathEnv) {
    if (storePathEnv === '~') return os.homedir();
    if (storePathEnv.startsWith('~/')) {
      return path.resolve(os.homedir(), storePathEnv.slice(2));
    }
    return storePathEnv;
  }
  return path.resolve(os.homedir(), '.copilot', 'mem0');
}

const dbPath = path.join(getStorePath(), 'memories.sqlite');
console.log(`Populating database at: ${dbPath}`);

function buildStringRecordBlock(record) {
  return Object.entries(record)
    .filter(([, value]) => typeof value === 'string' && value.length > 0)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}

function buildMemoryDedupeKey(kind, content, scope, metadata) {
  return crypto.createHash('sha256')
    .update([
      `kind: ${kind}`,
      `content:\n${content}`,
      `scope:\n${buildStringRecordBlock(scope)}`,
      `metadata:\n${buildStringRecordBlock(metadata)}`,
    ].join('\n\n'), 'utf8')
    .digest('hex');
}

const keysToInsert = [
  {
    key: 'gradeflow:architecture:current',
    content: 'gradeflow:architecture:current - The active architecture of GradeFlow utilizes Next.js App Router route groups (os/workspace), Zustand (usmStore for offline-first state and dynamicIslandStore for transient notifications), and the Mastra event-driven CNS layer.'
  },
  {
    key: 'gradeflow:schema:complete',
    content: 'gradeflow:schema:complete - Mapped 18 existing database models. Designed 3 new schemas: Academic Calendar (academic_calendar_events), Timetable (timetable_slots), and Backlog Recovery/ATKT (backlog_records, atkt_rules) with custom Prisma relations, cascade deletes, and RLS policies.'
  },
  {
    key: 'gradeflow:api:complete',
    content: 'gradeflow:api:complete - Comprehensive API route registry containing REST and NDJSON streaming endpoints. Audited validation layers (Zod + Hydration checksums), CORS policy configurations, and ESLint compiler/React hook violations.'
  },
  {
    key: 'gradeflow:ai:architecture',
    content: 'gradeflow:ai:architecture - Unifies the conversational pipeline by routing between Gemini 2.5 Flash (low latency, indexing/chats) and DeepSeek R1 (reasoning, Box-Cox, study planners), using Mastra CNS event loops.'
  },
  {
    key: 'gradeflow:prompts:*',
    content: 'gradeflow:prompts:* - AI prompt archive indexing system instructions for legacy/voice assistants and introducing 3 new drafted prompts: Study Planner, Bunk Optimizer, and Placement Readiness Auditor.'
  },
  {
    key: 'gradeflow:security:audit',
    content: 'gradeflow:security:audit - Analyzed cookie-based Supabase SSR auth, Next.js route boundaries middleware, data security/PII leaks, plain-text env exposures, compliance rules (FERPA/DPDP), and completed mock redirect simulations.'
  }
];

try {
  const db = new Database(dbPath);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      content TEXT NOT NULL,
      scope TEXT NOT NULL,
      provenance TEXT NOT NULL,
      metadata TEXT NOT NULL,
      embedding TEXT NOT NULL,
      dedupe_key TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  const insertStmt = db.prepare(`
    INSERT INTO memories (id, kind, content, scope, provenance, metadata, embedding, dedupe_key, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      content = excluded.content,
      dedupe_key = excluded.dedupe_key,
      updated_at = excluded.updated_at
  `);

  const now = new Date().toISOString();
  
  for (const item of keysToInsert) {
    const id = crypto.randomUUID();
    const kind = 'artifact_context';
    const scope = { workspace: 'gradeflow', project: 'gradeflow' };
    const provenance = { artifactIds: [] };
    const metadata = { key: item.key };
    const content = item.content;
    const embedding = [0.0]; // mock embedding
    const dedupe_key = buildMemoryDedupeKey(kind, content, scope, metadata);

    insertStmt.run(
      id,
      kind,
      content,
      JSON.stringify(scope),
      JSON.stringify(provenance),
      JSON.stringify(metadata),
      JSON.stringify(embedding),
      dedupe_key,
      now,
      now
    );
    console.log(`Inserted/updated key: ${item.key}`);
  }
  
  console.log('Successfully populated mem0 sqlite database with required keys!');
} catch (err) {
  console.error('Error inserting keys:', err.message);
}
