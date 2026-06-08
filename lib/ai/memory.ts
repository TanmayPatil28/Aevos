import { createClient } from '@/lib/supabase/server';
import { embed, embedMany } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const EMBEDDING_MODEL = google.textEmbeddingModel('text-embedding-004');

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

    const { error } = await supabase.from('user_memory').insert({
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
