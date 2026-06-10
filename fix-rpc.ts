import { prisma } from './lib/prisma';

async function run() {
  console.log('Dropping old functions...');
  await prisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS public.match_memories(public.vector, double precision, integer, text);`);
  await prisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS public.match_memories(public.vector, double precision, integer, uuid);`);
  
  console.log('Creating correct function...');
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION match_memories(
      query_embedding vector(768),
      match_threshold float,
      match_count int,
      p_user_id text
    )
    RETURNS TABLE (
      id text,
      content text,
      similarity float
    )
    LANGUAGE plpgsql
    AS $$
    BEGIN
      RETURN QUERY
      SELECT
        user_memories.id::text,
        user_memories.content,
        1 - (user_memories.embedding <=> query_embedding) AS similarity
      FROM user_memories
      WHERE 
        user_memories.user_id = p_user_id
        AND 1 - (user_memories.embedding <=> query_embedding) > match_threshold
      ORDER BY user_memories.embedding <=> query_embedding
      LIMIT match_count;
    END;
    $$;
  `);
  console.log('Done!');
}

run().catch(console.error).finally(() => prisma.$disconnect());
