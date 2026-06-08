export function getGeminiKey(): string {
  // Support either a single GEMINI_API_KEY or a comma-separated list of keys
  const keysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
  const keys = keysStr.split(',').map(k => k.trim()).filter(Boolean);
  
  if (keys.length > 0) {
    // Pick a random key from the pool to distribute load and circumvent rate limits
    const randomIndex = Math.floor(Math.random() * keys.length);
    return keys[randomIndex];
  }
  
  return "";
}
