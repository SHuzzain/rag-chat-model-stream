import { tool } from "ai";
import z from "zod";

import { ragSearch } from "@/feature/knowledge/queries/rag-search.queries";
import { generateEmbedding } from "@/lib/embeddings";

export function createSearchKnowledgeBaseTool({
  topK = 5,
  chatbotId,
  organizationId,
}: {
  topK?: number;
  chatbotId?: string;
  organizationId?: string;
}) {
  return tool({
    description:
      "Search this chatbot's knowledge base for relevant information. Use this tool to find context before answering any user question. Always search first before responding.",
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "The search query to find relevant context from the knowledge base"
        ),
    }),
    outputSchema: z.array(
      z.object({
        text: z.string(),
        source: z.string(),
        documentId: z.string(),
        score: z.number(),
      })
    ),
    execute: async ({ query }: { query: string }) => {
      if (!chatbotId || !organizationId) return [];

      const embedding = await generateEmbedding(query);
      const results = await ragSearch({
        queryEmbedding: embedding,
        chatbotId,
        organizationId,
        topK,
      });

      return results.map((result) => ({
        text: result.content,
        source: result.sourceName,
        documentId: result.documentId,
        score: result.score,
      }));
    },
  });
}
