import { tool } from "ai"
import z from "zod"
import { generateEmbedding } from "../embeddings"
import { ragSearch } from "../rag-search"

/**
 * Tool: Search the knowledge base using vector similarity.
 * The agent calls this to retrieve relevant document chunks
 * before answering the user's question.
 */
export function createSearchKnowledgeBaseTool() {
  return tool({
    description:
      "Search the knowledge base for relevant information. Use this tool to find context before answering any user question. Always search first before responding.",
    inputSchema: z.object({
      query: z.string().describe("The search query to find relevant context from the knowledge base"),
    }),
    outputSchema: z.array(z.object({
      text: z.string(),
      source: z.string(),
      score: z.number(),
    })),
    execute: async ({ query }: { query: string }) => {
      const embedding = await generateEmbedding(query)
      const results = await ragSearch({
        queryEmbedding: embedding,
        topK: 5,
      })
      return results.map((r) => ({
        text: r.text,
        source: r.source,
        score: r.score,
      }))
    },
  })
}
