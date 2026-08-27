"use server";

import { and, asc, cosineDistance, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import { documentChunks } from "@/db/schema";
import { getAttachedKnowledgeBaseIdsForRuntime } from "@/feature/knowledge/actions/knowledge.actions";

export type RagSearchResult = {
  id: string;
  documentId: string;
  content: string;
  sourceName: string;
  sourceUrl: string | null;
  chunkIndex: number;
  score: number;
};

export async function ragSearch({
  queryEmbedding,
  chatbotId,
  organizationId,
  topK = 20,
}: {
  queryEmbedding: number[];
  chatbotId: string;
  organizationId: string;
  topK?: number;
}): Promise<RagSearchResult[]> {
  const knowledgeBaseIds = await getAttachedKnowledgeBaseIdsForRuntime(
    chatbotId,
    organizationId
  );
  if (knowledgeBaseIds.length === 0) return [];

  const similarityScore = sql<number>`${cosineDistance(documentChunks.embedding, queryEmbedding)}`;

  const results = await db
    .select({
      id: documentChunks.id,
      documentId: documentChunks.documentId,
      content: documentChunks.content,
      sourceName: documentChunks.sourceName,
      sourceUrl: documentChunks.sourceUrl,
      chunkIndex: documentChunks.chunkIndex,
      score: similarityScore,
    })
    .from(documentChunks)
    .where(
      and(
        eq(documentChunks.organizationId, organizationId),
        inArray(documentChunks.knowledgeBaseId, knowledgeBaseIds)
      )
    )
    .orderBy(asc(similarityScore))
    .limit(topK);

  return results.map((row) => ({
    id: row.id,
    documentId: row.documentId,
    content: row.content,
    sourceName: row.sourceName,
    sourceUrl: row.sourceUrl,
    chunkIndex: row.chunkIndex,
    score: Number(row.score),
  }));
}
