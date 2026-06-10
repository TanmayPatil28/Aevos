import { prisma } from "@/lib/prisma";

export interface ChatTurn {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: any;
}

/**
 * Saves a single chat message to the persistent chat_memory table.
 */
export async function saveMessage(
  userId: string,
  sessionId: string,
  role: "user" | "assistant" | "system",
  content: string,
  metadata?: any
): Promise<boolean> {
  try {
    await prisma.chatMemory.create({
      data: {
        userId,
        sessionId,
        role,
        content,
        metadata: metadata || {},
      },
    });
    return true;
  } catch (err) {
    console.error("[ChatMemory] Error saving message:", err);
    return false;
  }
}

/**
 * Loads the last `limit` turns for a given session.
 */
export async function loadConversation(
  userId: string,
  sessionId: string,
  limit: number = 10
): Promise<ChatTurn[]> {
  try {
    const memories = await prisma.chatMemory.findMany({
      where: { userId, sessionId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return memories.reverse().map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
      metadata: m.metadata,
    }));
  } catch (err) {
    console.error("[ChatMemory] Error loading conversation:", err);
    return [];
  }
}

/**
 * Retrieves the most recent conversational context for Mastra injection.
 */
export async function getRecentConversationContext(
  userId: string,
  sessionId: string,
  limit: number = 10
): Promise<string> {
  const turns = await loadConversation(userId, sessionId, limit);
  if (turns.length === 0) return "No recent conversation history.";
  
  return turns
    .map((t) => `${t.role === "user" ? "User" : "Jarvis"}: ${t.content}`)
    .join("\n");
}
