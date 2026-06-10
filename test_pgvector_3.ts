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
    await client.query(`CREATE INDEX test_vector_123_embedding_idx ON test_vector_123 USING btree(embedding);`);
    
    // Insert some data
    await client.query(`INSERT INTO test_vector_123 (embedding) VALUES ('[1,2,3]'), ('[4,5,6]'), ('[7,8,9]');`);
    
    // Explain query
    const res = await client.query(`
      EXPLAIN SELECT * FROM test_vector_123 ORDER BY embedding <-> '[1,2,3]' LIMIT 5;
    `);
    console.log("Explain output:");
    res.rows.forEach(r => console.log(r["QUERY PLAN"]));
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : String(e));
  } finally {
    await client.query(`DROP TABLE IF EXISTS test_vector_123;`);
    await client.end();
  }
}
main();
