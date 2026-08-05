import { convertToModelMessages, generateText, UIMessage } from "ai"
import { openai } from "@ai-sdk/openai"

/**
 * Rewrites a user question into an optimized standalone search query.
 * Useful when the question is conversational, ambiguous, or part of
 * a multi-turn dialogue where context from prior messages is needed.
 *
 * @param userQuestion - The raw user question
 * @param conversationHistory - Optional prior conversation messages for context
 * @returns A rewritten, standalone search query string
 */
export async function rewriteQuery(
  userQuestion: string,
  conversationHistory?: UIMessage[]
): Promise<string> {
  // If no conversation history, the question is likely already standalone
  if (!conversationHistory || conversationHistory.length === 0) {
    return userQuestion
  }

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system: `You are a search query optimizer. Your job is to rewrite a user's question into a clear, standalone search query that will retrieve the most relevant documents from a knowledge base.

Rules:
- Incorporate relevant context from the conversation history
- Remove conversational filler (e.g., "can you tell me", "I was wondering")
- Preserve specific names, dates, and technical terms exactly
- Output ONLY the rewritten query, nothing else
- Keep the query concise (under 50 words)
- If the original question is already clear and standalone, return it as-is`,
    messages: await convertToModelMessages([...conversationHistory, {
      role: "user", parts: [
        {
          type: "text",
          text: `Rewrite this question as a standalone search query:\n\n"${userQuestion}"`,
        }
      ]
    }]),
  })

  return text.trim()
}
