const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

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
console.log(`Attempting to open database at: ${dbPath}`);

try {
  const db = new Database(dbPath, { fileMustExist: true });
  console.log('Database opened successfully.');
  
  const stmt = db.prepare('SELECT id, kind, content, scope, metadata FROM memories');
  const rows = stmt.all();
  
  console.log(`Found ${rows.length} total memories stored.`);
  console.log('----------------------------------------------------');
  for (const row of rows) {
    const scope = JSON.parse(row.scope);
    const metadata = JSON.parse(row.metadata);
    console.log(`- ID: ${row.id}`);
    console.log(`  Kind: ${row.kind}`);
    console.log(`  Content Preview: ${row.content.substring(0, 100)}`);
    console.log(`  Scope: ${JSON.stringify(scope)}`);
    console.log(`  Metadata: ${JSON.stringify(metadata)}`);
    console.log('----------------------------------------------------');
  }

  // Check for the specific keys requested
  const requiredKeys = [
    'gradeflow:architecture:current',
    'gradeflow:schema:complete',
    'gradeflow:api:complete',
    'gradeflow:ai:architecture',
    'gradeflow:prompts:*',
    'gradeflow:security:audit'
  ];

  console.log('\nChecking for required keys status:');
  const foundKeys = {};
  for (const key of requiredKeys) {
    // We check if the key matches or is stored in the content/metadata/scope
    // E.g., we search row contents or metadata keys
    const match = rows.find(r => {
      const isContentMatch = r.content.includes(key);
      const isMetadataMatch = JSON.stringify(JSON.parse(r.metadata)).includes(key);
      const isScopeMatch = JSON.stringify(JSON.parse(r.scope)).includes(key);
      return isContentMatch || isMetadataMatch || isScopeMatch;
    });

    if (match) {
      console.log(`[FOUND] ${key} (stored in memory ID: ${match.id})`);
      foundKeys[key] = match.id;
    } else {
      console.log(`[NOT FOUND] ${key}`);
    }
  }

} catch (err) {
  console.error('Failed to query sqlite database:', err.message);
}
