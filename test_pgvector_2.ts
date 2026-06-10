import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
  });
  await client.connect();
  console.log("Connected");
  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
    await client.query(`CREATE TABLE IF NOT EXISTS test_vector_123 (id serial, embedding vector(3));`);
    await client.query(`CREATE INDEX ON test_vector_123(embedding);`);
    const res = await client.query(`
      SELECT indexdef 
      FROM pg_indexes 
      WHERE tablename = 'test_vector_123';
    `);
    console.log("Index definition:", res.rows);
  } catch (e) {
    console.error("Error creating index:", e instanceof Error ? e.message : String(e));
  } finally {
    await client.query(`DROP TABLE IF EXISTS test_vector_123;`);
    await client.end();
  }
}
main();
