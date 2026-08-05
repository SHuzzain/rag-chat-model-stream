"use server"

import { runRAGAgent, type RAGAgentResult } from "@/lib/rag-agent"
import { UIMessage } from "ai"

export type RAGPipelineInput = {
  lastMessage: string
  conversationHistory?: UIMessage[]
  enableQueryRewrite?: boolean
  vectorWeight?: number
  searchTopK?: number
  rerankTopK?: number
}

/**
 * Server action that executes the full RAG pipeline.
 * Accepts a user question (with optional conversation history)
 * and returns a grounded answer with source citations.
 */
export async function executeRAGPipeline(
  input: RAGPipelineInput
): Promise<RAGAgentResult> {
  try {
    console.log(`[RAG Pipeline] Processing question: "${input.lastMessage}"`)

    const result = await runRAGAgent({
      lastMessage: input.lastMessage,
      conversationHistory: input.conversationHistory,
      enableQueryRewrite: input.enableQueryRewrite ?? true,
      vectorWeight: input.vectorWeight ?? 0.7,
      searchTopK: input.searchTopK ?? 20,
      rerankTopK: input.rerankTopK ?? 5,
    })

    console.log(
      `[RAG Pipeline] Complete — ${result.retrievedChunks} retrieved, ${result.finalChunks} after rerank, ${result.sources.length} unique sources`
    )

    return result
  } catch (error) {
    console.error("[RAG Pipeline] Error:", error)
    throw new Error("Failed to process your question. Please try again.")
  }
}
