import { convertToModelMessages, UIMessage } from "ai"
import type { HybridSearchResult } from "./hybrid-search"

export type RAGContext = {
  systemPrompt: string
  contextBlock: string
  userPrompt: string
}

/**
 * Builds a structured RAG prompt with retrieved context chunks.
 * Formats each chunk with source metadata for citation and
 * enforces groundedness guidelines in the system instruction.
 *
 * @param question - The user's question
 * @param contextChunks - Top re-ranked chunks to include as context
 * @param systemInstruction - Optional custom system instruction override
 * @returns Structured prompt components ready for LLM consumption
 */
export function buildRAGPrompt({
  lastMessage,
  contextChunks,
  systemInstruction,
}: {
  lastMessage: string
  contextChunks: HybridSearchResult[]
  systemInstruction?: string
}): RAGContext {
  const defaultSystemInstruction = `You are a helpful and knowledgeable assistant. Answer the user's question accurately based on the provided context.

Rules:
- Answer ONLY using information from the provided context chunks below.
- If the context does not contain enough information to answer, say so honestly.
- When referencing information, cite the source (e.g., [Source: <url or document>]).
- Be concise but thorough. Provide specific details when available.
- If multiple context chunks discuss the same topic, synthesize the information.
- Do not make up facts or hallucinate information not present in the context.`

  let contextBlock = '';
  if (contextChunks.length) {
    contextBlock = contextChunks
      .map(
        (chunk, i) =>
          `[Chunk ${i + 1}] (Source: ${chunk.source}, Score: ${chunk.score.toFixed(3)})
  ${chunk.text}`
      )
      .join("\n\n---\n\n")
  }

  return {
    systemPrompt: systemInstruction || defaultSystemInstruction,
    contextBlock,
    userPrompt: lastMessage,
  }
}


export async function buildRAGMessages({
  lastMessage,
  contextChunks,
  systemInstruction,
  conversationHistory,
}: {
  lastMessage: string
  contextChunks: HybridSearchResult[]
  systemInstruction?: string
  conversationHistory?: UIMessage[]
}) {
  const { systemPrompt, contextBlock } = buildRAGPrompt({
    lastMessage,
    contextChunks,
    systemInstruction,
  })

  let system = systemPrompt
  if (contextChunks.length) {
    system = `${systemPrompt}\n\nContext:\n${contextBlock}`
  }


  const messages = await convertToModelMessages(conversationHistory || [])

  return {
    system,
    messages,
  }
}
