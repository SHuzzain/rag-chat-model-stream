"use server";

import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import {
  chatbotKnowledgeBases,
  documentChunks,
  documents,
  knowledgeBases,
} from "@/db/schema";
import { extractFileToDrafts } from "@/feature/knowledge/actions/extract-file";
import { createLibraryKnowledgeBase } from "@/feature/knowledge/queries/knowledge.queries";
import type { ChunkDraft, KnowledgeFileType } from "@/feature/knowledge/types";
import { getMembershipRole } from "@/feature/org/queries/org.queries";
import { generateEmbeddings } from "@/lib/embeddings";
import { canEditChatbots } from "@/lib/permissions";
import { requireOrgSession } from "@/lib/session";
import { createHash } from "@/lib/utils";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const FILE_TYPES = new Set<KnowledgeFileType>([
  "json",
  "pdf",
  "csv",
  "xlsx",
  "docx",
]);

async function assertCanEdit() {
  const ctx = await requireOrgSession();
  const role = await getMembershipRole();
  if (!canEditChatbots(role)) throw new Error("Forbidden");
  return ctx;
}

async function attachKnowledgeBase({
  chatbotId,
  knowledgeBaseId,
  organizationId,
}: {
  chatbotId: string;
  knowledgeBaseId: string;
  organizationId: string;
}) {
  await db
    .insert(chatbotKnowledgeBases)
    .values({
      id: nanoid(),
      organizationId,
      chatbotId,
      knowledgeBaseId,
    })
    .onConflictDoNothing();
}

async function persistChunks({
  name,
  sourceType,
  sourceUrl,
  drafts,
  chatbotId,
}: {
  name: string;
  sourceType: "url" | "docx" | "pdf" | "txt" | "json" | "csv" | "xlsx";
  sourceUrl?: string;
  drafts: ChunkDraft[];
  chatbotId?: string;
}) {
  const { organizationId, user } = await assertCanEdit();
  if (drafts.length === 0) throw new Error("No content to ingest");

  const knowledgeBase = await createLibraryKnowledgeBase(name);
  const documentId = nanoid();
  const checksum = createHash(drafts.map((draft) => draft.checksum).join(""));

  await db.insert(documents).values({
    id: documentId,
    organizationId,
    knowledgeBaseId: knowledgeBase.id,
    name,
    sourceType,
    sourceUrl: sourceUrl ?? null,
    status: "PROCESSING",
    checksum,
    createdBy: user.id,
  });

  try {
    const embeddings = await generateEmbeddings(
      drafts.map((draft) => draft.content)
    );

    await db.insert(documentChunks).values(
      drafts.map((draft, index) => ({
        id: nanoid(),
        organizationId,
        knowledgeBaseId: knowledgeBase.id,
        documentId,
        content: draft.content,
        embedding: embeddings[index]!,
        sourceName: draft.sourceName,
        sourceUrl: draft.sourceUrl ?? sourceUrl ?? null,
        section: draft.section ?? null,
        chunkIndex: draft.chunkIndex,
        checksum: draft.checksum,
        metaData: draft.metaData,
      }))
    );

    await db
      .update(documents)
      .set({ status: "READY" })
      .where(eq(documents.id, documentId));
  } catch (error) {
    await db
      .update(documents)
      .set({ status: "FAILED" })
      .where(eq(documents.id, documentId));
    throw error;
  }

  if (chatbotId) {
    await attachKnowledgeBase({
      chatbotId,
      knowledgeBaseId: knowledgeBase.id,
      organizationId,
    });
    revalidatePath(`/chatbots/${chatbotId}`);
  }

  revalidatePath("/knowledge");
}

export async function ingestFileAction(formData: FormData) {
  await assertCanEdit();
  const chatbotId = String(formData.get("chatbotId") ?? "").trim() || undefined;
  const sourceType = String(formData.get("sourceType") ?? "") as KnowledgeFileType;
  const file = formData.get("file");

  if (!FILE_TYPES.has(sourceType)) throw new Error("Unsupported file type");
  if (!(file instanceof File)) throw new Error("File is required");
  if (file.size === 0) throw new Error("File is empty");
  if (file.size > MAX_FILE_BYTES) throw new Error("File must be 10 MB or smaller");

  const buffer = Buffer.from(await file.arrayBuffer());
  const sourceName = file.name.replace(/\.[^.]+$/, "") || file.name;
  const drafts = await extractFileToDrafts({
    buffer,
    sourceType,
    sourceName,
  });

  await persistChunks({
    name: file.name,
    sourceType,
    drafts,
    chatbotId,
  });
}

export async function attachKnowledgeAction(formData: FormData) {
  const { organizationId } = await assertCanEdit();
  const chatbotId = String(formData.get("chatbotId") ?? "");
  const knowledgeBaseId = String(formData.get("knowledgeBaseId") ?? "");
  if (!chatbotId || !knowledgeBaseId) throw new Error("Missing knowledge");

  const [kb] = await db
    .select({ id: knowledgeBases.id })
    .from(knowledgeBases)
    .where(
      and(
        eq(knowledgeBases.id, knowledgeBaseId),
        eq(knowledgeBases.organizationId, organizationId)
      )
    )
    .limit(1);
  if (!kb) throw new Error("Knowledge not found");

  await attachKnowledgeBase({ chatbotId, knowledgeBaseId, organizationId });
  revalidatePath(`/chatbots/${chatbotId}`);
  revalidatePath("/knowledge");
}

export async function detachKnowledgeAction(formData: FormData) {
  const { organizationId } = await assertCanEdit();
  const chatbotId = String(formData.get("chatbotId") ?? "");
  const knowledgeBaseId = String(formData.get("knowledgeBaseId") ?? "");
  if (!chatbotId || !knowledgeBaseId) throw new Error("Missing knowledge");

  await db
    .delete(chatbotKnowledgeBases)
    .where(
      and(
        eq(chatbotKnowledgeBases.chatbotId, chatbotId),
        eq(chatbotKnowledgeBases.knowledgeBaseId, knowledgeBaseId),
        eq(chatbotKnowledgeBases.organizationId, organizationId)
      )
    );

  revalidatePath(`/chatbots/${chatbotId}`);
  revalidatePath("/knowledge");
}

export async function deleteDocumentAction(formData: FormData) {
  const { organizationId } = await assertCanEdit();
  const documentId = String(formData.get("documentId") ?? "");
  if (!documentId) throw new Error("Missing document");

  const [document] = await db
    .select()
    .from(documents)
    .where(
      and(eq(documents.id, documentId), eq(documents.organizationId, organizationId))
    )
    .limit(1);
  if (!document) throw new Error("Document not found");

  await db.delete(documents).where(eq(documents.id, document.id));
  await db
    .delete(knowledgeBases)
    .where(eq(knowledgeBases.id, document.knowledgeBaseId));

  revalidatePath("/knowledge");
}
