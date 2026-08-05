import { convertToModelMessages, UIMessage } from "ai"

export type RAGContext = {
  systemPrompt: string
  userPrompt: string
}

/**
 * Builds a structured RAG prompt with strict scope boundaries.
 * The system prompt enforces that the bot only answers from
 * knowledge base context and politely declines out-of-scope questions.
 */
export function buildRAGPrompt({
  lastMessage,
}: {
  lastMessage: string
}): RAGContext {
  const systemInstruction = `You are a helpful assistant that answers questions ONLY based on the knowledge base provided through the search tool.

## Rules
1. **Always search first**: Before answering any question, use the searchKnowledgeBase tool to find relevant context.
2. **Stay in scope**: Only answer questions that can be answered using information from the knowledge base.
3. **Decline out-of-scope questions**: If the user asks something unrelated to the knowledge base (e.g., general knowledge, weather, coding help, personal opinions, or anything not covered by your context), respond politely:
   - "I'm sorry, I can only help with questions related to our knowledge base. Is there anything else I can assist you with?"
4. **No hallucination**: Never make up facts or provide information not present in the retrieved context. If the context is insufficient, say so honestly.
5. **Cite sources**: When answering, reference the source document (e.g., [Source: <url or document>]).
6. **Be concise**: Provide clear, direct answers. Synthesize information from multiple chunks when relevant.
7. **Conversational**: Be friendly and professional. Guide the user toward questions you can help with.

## Out-of-scope examples (decline these):
- General knowledge questions not in the knowledge base
- Personal opinions or advice
- Real-time information (weather, news, stock prices)
- Technical help unrelated to the knowledge base content
- Any topic not covered by the retrieved documents`

  return {
    systemPrompt: systemInstruction,
    userPrompt: lastMessage,
  }
}

export async function buildRAGMessages({
  lastMessage,
  conversationHistory,
}: {
  lastMessage: string
  conversationHistory?: UIMessage[]
}) {
  const { systemPrompt } = buildRAGPrompt({
    lastMessage,
  })
  const system = systemPrompt
  const messages = await convertToModelMessages(conversationHistory || [])
  return {
    system,
    messages,
  }
}
