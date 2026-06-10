import { createClient } from '@/lib/supabase/server';
import { embed, embedMany } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { getFireworksKey } from '@/lib/ai/keys';
import crypto from 'crypto';

const openai = createOpenAI({
  apiKey: getFireworksKey(),
  baseURL: "https://api.fireworks.ai/inference/v1"
});
const EMBEDDING_MODEL = openai.embedding('nomic-ai/nomic-embed-text-v1.5');

export interface Memory {
  id: string;
  content: string;
  similarity?: number;
}

/**
 * Generates an embedding for the content and saves it to the user's vector DB.
 */
export async function memorizeUserDetail(content: string): Promise<boolean> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('[Memory] Cannot memorize: User not authenticated');
    return false;
  }

  try {
    const { embedding } = await embed({
      model: EMBEDDING_MODEL,
      value: content,
    });

    const { error } = await supabase.from('user_memories').insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      content,
      embedding,
    });

    if (error) {
      console.error('[Memory] Error inserting memory:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Memory] Failed to generate embedding or insert:', err);
    return false;
  }
}

/**
 * Batch generates embeddings for multiple chunks of a document.
 */
export async function memorizeDocumentChunks(chunks: string[], documentId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.id) return false;

    // Embed all chunks in parallel
    const { embeddings } = await embedMany({
      model: EMBEDDING_MODEL,
      values: chunks,
    });

    // Map into rows
    const rows = chunks.map((content, i) => ({
      id: crypto.randomUUID(),
      user_id: user.id,
      document_id: documentId,
      content,
      embedding: embeddings[i],
    }));

    const { error } = await supabase.from('user_memories').insert(rows);

    if (error) {
      console.error('[Memory] Error inserting document chunks:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Memory] Failed to batch embed document chunks:', err);
    return false;
  }
}

/**
 * Searches the vector DB for memories similar to the query.
 */
export async function retrieveMemories(query: string, matchCount: number = 5, threshold: number = 0.5): Promise<Memory[]> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  try {
    const { embedding } = await embed({
      model: EMBEDDING_MODEL,
      value: query,
    });

    // Call the Postgres function we created
    const { data, error } = await supabase.rpc('match_memories', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: matchCount,
      p_user_id: user.id,
    });

    if (error) {
      console.error('[Memory] Error searching memories:', error);
      return [];
    }

    return data as Memory[];
  } catch (err) {
    console.error('[Memory] Failed to search memories:', err);
    return [];
  }
}
