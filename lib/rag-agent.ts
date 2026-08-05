import { generateText, streamText, isStepCount, tool, UIMessage } from "ai"
import { openai } from "@ai-sdk/openai"
import z from "zod"
import { generateEmbedding } from "./embeddings"
import { hybridSearch } from "./hybrid-search"
import { rewriteQuery } from "./query-rewrite"
import { rerankChunks } from "./rerank"
import { buildRAGMessages } from "./prompt-builder"

export type RAGAgentOptions = {
  lastMessage: string
  conversationHistory?: UIMessage[]
  enableQueryRewrite?: boolean
  vectorWeight?: number
  searchTopK?: number
  rerankTopK?: number
  systemInstruction?: string
  signal?: AbortSignal
}

export type RAGAgentResult = {
  answer: string
  sources: { source: string; relevanceScore: number }[]
  rewrittenQuery?: string
  retrievedChunks: number
  finalChunks: number
}

/**
 * Creates the searchKnowledgeBase tool definition for use in agent calls.
 * Extracted to avoid duplication between generateText and streamText.
 */
function createSearchTool(vectorWeight: number) {
  return tool({
    description:
      "Search the knowledge base for additional information when the provided context is insufficient.",
    inputSchema: z.object({
      query: z.string().describe("The search query to find additional context"),
    }),
    outputSchema: z.array(z.object({
      text: z.string(),
      source: z.string(),
      score: z.number(),
    })),
    execute: async ({ query }: { query: string }) => {
      const additionalEmbedding = await generateEmbedding(query)
      const additionalResults = await hybridSearch({
        queryText: query,
        queryEmbedding: additionalEmbedding,
        topK: 5,
        vectorWeight,
      })
      return additionalResults.map((r) => ({
        text: r.text,
        source: r.source,
        score: r.score,
      }))
    },
  })
}

/**
 * Runs the full RAG pipeline:
 * 1. Query Rewrite (optional)
 * 2. Generate Query Embedding
 * 3. Hybrid Search (pgvector + tsvector)
 * 4. Merge Results & Sort by Combined Score
 * 5. Re-rank Top Results
 * 6. Build Prompt with Context
 * 7. Agent generates final response (with MCP tools)
 */
export async function runRAGAgent({
  lastMessage,
  conversationHistory,
  enableQueryRewrite = true,
  vectorWeight = 0.7,
  searchTopK = 20,
  rerankTopK = 5,
  systemInstruction,
}: RAGAgentOptions): Promise<RAGAgentResult> {
  // Step 1: Query Rewrite (optional)
  let searchQuery = lastMessage
  let rewrittenQuery: string | undefined

  if (enableQueryRewrite && conversationHistory && conversationHistory.length > 0) {
    searchQuery = await rewriteQuery(lastMessage, conversationHistory)
    rewrittenQuery = searchQuery
    console.log(`[RAG] Query rewritten: "${lastMessage}" → "${searchQuery}"`)
  }

  // Step 2: Generate Query Embedding
  const queryEmbedding = await generateEmbedding(searchQuery)
  console.log(`[RAG] Generated embedding for query (${queryEmbedding.length} dimensions)`)

  // Step 3 & 4: Hybrid Search — pgvector + tsvector, merged & sorted by score
  const searchResults = await hybridSearch({
    queryText: searchQuery,
    queryEmbedding,
    topK: searchTopK,
    vectorWeight,
  })
  console.log(`[RAG] Hybrid search returned ${searchResults.length} candidates`)

  if (searchResults.length === 0) {
    return {
      answer:
        "I couldn't find any relevant information in the knowledge base to answer your question. Could you try rephrasing your question?",
      sources: [],
      rewrittenQuery,
      retrievedChunks: 0,
      finalChunks: 0,
    }
  }

  // Step 5: Re-rank Results
  const rerankedChunks = await rerankChunks(searchQuery, searchResults, rerankTopK)
  console.log(`[RAG] Re-ranked to ${rerankedChunks.length} top chunks`)

  // Step 6: Build Prompt with Context
  const { system, messages } = await buildRAGMessages({
    lastMessage,
    contextChunks: rerankedChunks,
    systemInstruction,
    conversationHistory,
  })

  // Step 7: Agent generates final response
  const { text } = await generateText({
    model: openai("gpt-4o"),
    system,
    messages,
    tools: {
      searchKnowledgeBase: createSearchTool(vectorWeight),
    },
    stopWhen: isStepCount(3),
  })

  // Deduplicate sources
  const uniqueSources = Array.from(
    new Map(
      rerankedChunks.map((chunk) => [
        chunk.source,
        { source: chunk.source, relevanceScore: chunk.relevanceScore },
      ])
    ).values()
  )

  return {
    answer: text,
    sources: uniqueSources,
    rewrittenQuery,
    retrievedChunks: searchResults.length,
    finalChunks: rerankedChunks.length,
  }
}

/**
 * Streaming variant of the RAG agent for real-time response delivery.
 * Returns a ReadableStream for use in API route handlers.
 */
export async function streamRAGAgent({
  lastMessage,
  conversationHistory,
  enableQueryRewrite = true,
  vectorWeight = 0.7,
  searchTopK = 20,
  rerankTopK = 5,
  systemInstruction,
  signal
}: RAGAgentOptions) {
  // Steps 1-6 are identical to runRAGAgent
  let searchQuery = lastMessage

  // if (enableQueryRewrite && conversationHistory && conversationHistory.length > 0) {
  //   searchQuery = await rewriteQuery(lastMessage, conversationHistory)
  // }

  // const queryEmbedding = await generateEmbedding(searchQuery)

  // const searchResults = await hybridSearch({
  //   queryText: searchQuery,
  //   queryEmbedding,
  //   topK: searchTopK,
  //   vectorWeight,
  // })

  // if (searchResults.length === 0) {
  //   // Return a simple stream with "no results" message
  //   return new ReadableStream({
  //     start(controller) {
  //       controller.enqueue(
  //         new TextEncoder().encode(
  //           "I couldn't find any relevant information in the knowledge base to answer your question."
  //         )
  //       )
  //       controller.close()
  //     },
  //   })
  // }

  // const rerankedChunks = await rerankChunks(searchQuery, searchResults, rerankTopK)

  const messages = await buildRAGMessages({
    lastMessage,
    contextChunks: [],
    systemInstruction,
    conversationHistory,
  })

  // Step 7: Streaming agent response
  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: messages.system,
    messages: messages.messages,
    tools: {
      searchKnowledgeBase: createSearchTool(vectorWeight),
    },
    abortSignal: signal,
    onAbort: ({ steps }) => {
      console.log('Stream aborted after', steps.length, 'steps');
    },
    stopWhen: isStepCount(3),
  })

  return result.stream
}
