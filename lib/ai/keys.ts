/**
 * Unified API key rotation utility for all AI providers.
 * Reads comma-separated keys from environment variables and returns a random one to distribute load and circumvent rate limits.
 */

function getRandomKey(envVarName: string): string {
  const keysStr = process.env[envVarName] || "";
  let keys = keysStr.split(',').map(k => k.trim()).filter(Boolean);
  
  if (envVarName.includes('GEMINI')) {
    keys = keys.filter(k => k.startsWith('AIzaSy'));
  }
  
  if (keys.length > 0) {
    const randomIndex = Math.floor(Math.random() * keys.length);
    return keys[randomIndex];
  }
  
  return "";
}

export function getGeminiKey(): string {
  return getRandomKey("GEMINI_API_KEYS") || getRandomKey("GEMINI_API_KEY");
}

export function getFireworksKey(): string {
  return getRandomKey("FIREWORKS_API_KEYS") || getRandomKey("FIREWORKS_API_KEY");
}

export function getMistralKey(): string {
  return getRandomKey("MISTRAL_API_KEY");
}

export function getDeepgramKey(): string {
  return getRandomKey("DEEPGRAM_API_KEY");
}

export function getTavilyKey(): string {
  return getRandomKey("TAVILY_API_KEY");
}

export function getCartesiaKey(): string {
  return getRandomKey("CARTESIA_API_KEY");
}

export function getGroqKey(): string {
  return getRandomKey("GROQ_API_KEY");
}
