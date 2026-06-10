import { prisma } from './lib/prisma';
import { jarvisAgent } from './lib/ai/agents/jarvis';
import { getGeminiKey } from './lib/ai/keys';
import { createOpenAI } from '@ai-sdk/openai';
import { embedMany } from 'ai';
import fs from 'fs';
import { getFireworksKey } from './lib/ai/keys';

const openai = createOpenAI({
  apiKey: getFireworksKey(),
  baseURL: "https://api.fireworks.ai/inference/v1"
});

async function chunkText(text: string, maxWords: number = 500): Promise<string[]> {
  return [text]; // Keep it simple for testing
}

async function run() {
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = getGeminiKey();

  const syllabusText = fs.readFileSync('fake-syllabus.txt', 'utf-8');
  
  console.log("Generating embedding directly...");
  const { embeddings } = await embedMany({
    model: openai.embedding('nomic-ai/nomic-embed-text-v1.5'),
    values: [syllabusText],
  });

  console.log("Storing in DB...");
  const embeddingArray = Array.from(embeddings[0]);
  const vectorString = `[${embeddingArray.join(',')}]`;

  // Get a user ID from the DB
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No user found");

  await prisma.$executeRaw`
    INSERT INTO user_memories (user_id, content, embedding, created_at)
    VALUES (${user.id}, ${syllabusText}, ${vectorString}::vector, NOW())
  `;
  
  console.log("Memorize success!");

  const query = "What are the grading percentages in CS301 based on my uploaded documents?";
  console.log("Querying Jarvis...");
  
  const result = await jarvisAgent.generate(query, { maxSteps: 5 });
  console.log("Jarvis raw result:", result.text);
  console.log("Tool results:", JSON.stringify(result.toolResults, null, 2));
}

run().catch(console.error);
