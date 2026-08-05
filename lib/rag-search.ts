import { sql, cosineDistance, asc } from "drizzle-orm"
import db from "@/connector/db.drizzle"
import { embeddingDocumentTable } from "@/schema"

export type RagSearchResult = {
  id: number
  text: string
  source: string
  sourceType: string
  chunkIndex: number
  metaData: unknown

  score: number
}


export async function ragSearch({
  queryEmbedding,
  topK = 20,
}: {
  queryEmbedding: number[]
  topK?: number
}): Promise<RagSearchResult[]> {


  const similarityScore = sql<number>`${cosineDistance(embeddingDocumentTable.embedding, queryEmbedding)}`;

  const results = await db
    .select({
      id: embeddingDocumentTable.id,
      text: embeddingDocumentTable.text,
      source: embeddingDocumentTable.source,
      sourceType: embeddingDocumentTable.sourceType,
      chunkIndex: embeddingDocumentTable.chunkIndex,
      metaData: embeddingDocumentTable.metaData,
      score: similarityScore,
    })
    .from(embeddingDocumentTable)
    .orderBy(asc(similarityScore))
    .limit(topK)

  return results.map((row) => ({
    id: row.id,
    text: row.text,
    source: row.source,
    sourceType: row.sourceType,
    chunkIndex: row.chunkIndex,
    metaData: row.metaData,
    score: Number(row.score),
  }))
}
