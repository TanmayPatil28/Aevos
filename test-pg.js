const { Client } = require('pg');

async function testConnection(url, name) {
  const client = new Client({ connectionString: url, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    console.log(`✅ [${name}] Connection successful!`);
    await client.end();
  } catch (error) {
    console.log(`❌ [${name}] Connection failed:`, error.message);
  }
}

async function run() {
  const urls = [
    { name: "Current DATABASE_URL (port 6543)", url: "postgresql://postgres.hnnzujludyseyaysofax:Tanmay%40120906@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true" },
    { name: "Current DIRECT_URL (port 5432)", url: "postgresql://postgres.hnnzujludyseyaysofax:Tanmay%40120906@aws-1-ap-south-1.pooler.supabase.com:5432/postgres" },
    { name: "Alternative aws-0 pooler (port 6543)", url: "postgresql://postgres.hnnzujludyseyaysofax:Tanmay%40120906@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true" },
    { name: "Alternative aws-0 direct (port 5432)", url: "postgresql://postgres.hnnzujludyseyaysofax:Tanmay%40120906@aws-0-ap-south-1.pooler.supabase.com:5432/postgres" },
    { name: "Direct to DB (port 5432)", url: "postgresql://postgres:Tanmay%40120906@db.hnnzujludyseyaysofax.supabase.co:5432/postgres" }
  ];

  for (const { name, url } of urls) {
    await testConnection(url, name);
  }
}

run();
