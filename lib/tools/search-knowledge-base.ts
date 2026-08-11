import { tool } from "ai"
import z from "zod"
import { generateEmbedding } from "../embeddings"
import { ragSearch } from "../../actions/rag-search"


interface SearchKnowledgeBaseType {
  topK?: number
}

export function createSearchKnowledgeBaseTool({ topK = 5 }: SearchKnowledgeBaseType) {
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
        topK,
      })
      console.log({ results })
      return results.map((r) => ({
        text: r.text,
        source: r.source,
        score: r.score,
      }))
    },
  })
}
