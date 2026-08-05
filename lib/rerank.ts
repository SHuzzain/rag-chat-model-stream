import { Output, generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import z from "zod"
import type { HybridSearchResult } from "./hybrid-search"

const rerankResultSchema = z.object({
  rankings: z.array(
    z.object({
      index: z.number().describe("The 0-based index of the chunk in the input array"),
      relevanceScore: z
        .number()
        .min(0)
        .max(10)
        .describe("Relevance score from 0 (not relevant) to 10 (highly relevant)"),
      reasoning: z.string().describe("Brief explanation of why this chunk is or isn't relevant"),
    })
  ),
})

/**
 * Re-ranks search result chunks by evaluating their semantic relevance
 * to the user query using an LLM as a cross-encoder / judge.
 *
 * @param query - The user's search query
 * @param chunks - Candidate chunks from hybrid search
 * @param topK - Number of top re-ranked results to return (default: 5)
 * @returns Re-ranked and filtered chunks sorted by LLM relevance score
 */
export async function rerankChunks(
  query: string,
  chunks: HybridSearchResult[],
  topK: number = 5
): Promise<(HybridSearchResult & { relevanceScore: number; reasoning: string })[]> {
  if (chunks.length === 0) return []

  // If we have fewer chunks than topK, just return them all
  if (chunks.length <= topK) {
    return chunks.map((chunk) => ({
      ...chunk,
      relevanceScore: chunk.combinedScore * 10,
      reasoning: "Passed through — fewer candidates than topK",
    }))
  }

  const chunkSummaries = chunks.map((chunk, i) => ({
    index: i,
    text: chunk.text.slice(0, 500), // Truncate to keep token usage reasonable
    source: chunk.source,
  }))

  const { output } = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: rerankResultSchema }),
    prompt: `You are a relevance judge. Given a user query and a list of text chunks retrieved from a knowledge base, score each chunk's relevance to the query.

User Query: "${query}"

Chunks to evaluate:
${chunkSummaries
        .map(
          (c) => `--- Chunk ${c.index} (source: ${c.source}) ---
${c.text}
---`
        )
        .join("\n\n")}

Score each chunk from 0 (completely irrelevant) to 10 (directly answers the query).
Consider:
- Does the chunk directly address the query?
- Does it contain key facts, names, or data points mentioned in the query?
- Is the information specific enough to be useful?

Return rankings for ALL chunks.`,
  })

  // Map scores back to chunks and sort by relevance
  const scoredChunks = output.rankings
    .map((ranking) => ({
      ...chunks[ranking.index],
      relevanceScore: ranking.relevanceScore,
      reasoning: ranking.reasoning,
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, topK)

  return scoredChunks
}
