import { sql, cosineDistance, desc, gt, and, asc } from "drizzle-orm"
import db from "@/connector/db.drizzle"
import { embeddingDocumentTable } from "@/schema"

export type HybridSearchResult = {
  id: number
  text: string
  source: string
  sourceType: string
  chunkIndex: number
  metaData: unknown
  // vectorScore: number
  // textScore: number
  // combinedScore: number
  score: number
}

/**
 * Performs hybrid search using both pgvector (cosine similarity) and
 * tsvector (PostgreSQL full-text search), then merges and sorts results
 * by a weighted combined score.
 *
 * @param queryText - The user's search query text (for keyword matching)
 * @param queryEmbedding - The embedding vector of the query (for semantic search)
 * @param topK - Number of top results to return (default: 20)
 * @param vectorWeight - Weight for vector score in combined ranking (default: 0.7)
 * @returns Merged results sorted by combinedScore descending
 */
export async function hybridSearch({
  queryText,
  queryEmbedding,
  topK = 20,
  vectorWeight = 0.7,
}: {
  queryText: string
  queryEmbedding: number[]
  topK?: number
  vectorWeight?: number
}): Promise<HybridSearchResult[]> {
  const textWeight = 1 - vectorWeight

  // // -- pgvector cosine similarity score: 1 - cosineDistance => [0, 1]
  // const vectorSimilarity = sql<number>`1 - (${cosineDistance(embeddingDocumentTable.embedding, queryEmbedding)})`

  // // -- tsvector full-text rank score
  // const textRank = sql<number>`ts_rank_cd(to_tsvector('simple', ${embeddingDocumentTable.text}), websearch_to_tsquery('simple', ${queryText}))`

  // // -- Combined weighted score
  // const combinedScore = sql<number>`(
  //   ${vectorWeight} * (1 - (${cosineDistance(embeddingDocumentTable.embedding, queryEmbedding)}))
  //   + ${textWeight} * ts_rank_cd(to_tsvector('simple', ${embeddingDocumentTable.text}), websearch_to_tsquery('simple', ${queryText}))
  // )`

  const similarityScore = sql<number>`${cosineDistance(embeddingDocumentTable.embedding, queryEmbedding)}`;

  const results = await db
    .select({
      id: embeddingDocumentTable.id,
      text: embeddingDocumentTable.text,
      source: embeddingDocumentTable.source,
      sourceType: embeddingDocumentTable.sourceType,
      chunkIndex: embeddingDocumentTable.chunkIndex,
      metaData: embeddingDocumentTable.metaData,
      // vectorScore: vectorSimilarity,
      // textScore: textRank,
      // combinedScore: combinedScore,
      score: similarityScore,
    })
    .from(embeddingDocumentTable)
    // .orderBy(desc(combinedScore))
    .orderBy(asc(similarityScore))
    .limit(topK)

  return results.map((row) => ({
    id: row.id,
    text: row.text,
    source: row.source,
    sourceType: row.sourceType,
    chunkIndex: row.chunkIndex,
    metaData: row.metaData,
    // vectorScore: Number(row.vectorScore),
    // textScore: Number(row.textScore),
    // combinedScore: Number(row.combinedScore),
    score: Number(row.score),
  }))
}
