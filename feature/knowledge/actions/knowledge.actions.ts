"use server";

import { and, desc, eq, notInArray } from "drizzle-orm";

import { db } from "@/db";
import {
  chatbotKnowledgeBases,
  documents,
  knowledgeBases,
} from "@/db/schema";
import { requireOrgSession } from "@/lib/session";

export async function listOrganizationDocuments() {
  const { organizationId } = await requireOrgSession();
  return db
    .select({
      id: documents.id,
      knowledgeBaseId: documents.knowledgeBaseId,
      name: documents.name,
      sourceType: documents.sourceType,
      sourceUrl: documents.sourceUrl,
      status: documents.status,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(eq(documents.organizationId, organizationId))
    .orderBy(desc(documents.createdAt));
}

export async function listAttachedDocuments(chatbotId: string) {
  const { organizationId } = await requireOrgSession();
  return db
    .select({
      id: documents.id,
      knowledgeBaseId: documents.knowledgeBaseId,
      name: documents.name,
      sourceType: documents.sourceType,
      sourceUrl: documents.sourceUrl,
      status: documents.status,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .innerJoin(
      chatbotKnowledgeBases,
      and(
        eq(chatbotKnowledgeBases.knowledgeBaseId, documents.knowledgeBaseId),
        eq(chatbotKnowledgeBases.chatbotId, chatbotId),
        eq(chatbotKnowledgeBases.organizationId, organizationId)
      )
    )
    .where(eq(documents.organizationId, organizationId))
    .orderBy(desc(documents.createdAt));
}

export async function listUnattachedKnowledge(chatbotId: string) {
  const { organizationId } = await requireOrgSession();
  const attached = await db
    .select({ knowledgeBaseId: chatbotKnowledgeBases.knowledgeBaseId })
    .from(chatbotKnowledgeBases)
    .where(
      and(
        eq(chatbotKnowledgeBases.chatbotId, chatbotId),
        eq(chatbotKnowledgeBases.organizationId, organizationId)
      )
    );
  const attachedIds = attached.map((row) => row.knowledgeBaseId);

  return db
    .select({
      knowledgeBaseId: knowledgeBases.id,
      name: documents.name,
    })
    .from(knowledgeBases)
    .innerJoin(documents, eq(documents.knowledgeBaseId, knowledgeBases.id))
    .where(
      attachedIds.length > 0
        ? and(
            eq(knowledgeBases.organizationId, organizationId),
            notInArray(knowledgeBases.id, attachedIds)
          )
        : eq(knowledgeBases.organizationId, organizationId)
    )
    .orderBy(desc(documents.createdAt));
}

export async function getAttachedKnowledgeBaseIdsForRuntime(
  chatbotId: string,
  organizationId: string
) {
  const rows = await db
    .select({ knowledgeBaseId: chatbotKnowledgeBases.knowledgeBaseId })
    .from(chatbotKnowledgeBases)
    .where(
      and(
        eq(chatbotKnowledgeBases.chatbotId, chatbotId),
        eq(chatbotKnowledgeBases.organizationId, organizationId)
      )
    );
  return rows.map((row) => row.knowledgeBaseId);
}
