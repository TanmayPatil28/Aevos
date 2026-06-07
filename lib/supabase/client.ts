import { createBrowserClient } from '@supabase/ssr'

const TIMEOUT_MS = 8000; // 8 seconds

const fetchWithTimeout = async (input: RequestInfo | URL, init?: RequestInit) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      console.warn(`[Supabase] Request timed out after ${TIMEOUT_MS}ms`);
    }
    throw error;
  }
};

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: fetchWithTimeout,
      },
    }
  )
}
