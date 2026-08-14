import {
  index,
  integer,
  json,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  vector,
} from "drizzle-orm/pg-core";

import { documentStatusEnum, sourceTypeEnum } from "../enums";
import { chatbots } from "./chatbot";
import { organization } from "./organization";
import { user } from "./user";

export type KnowledgeChunkMeta = Record<string, unknown>;

export const knowledgeBases = pgTable(
  "knowledge_bases",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("knowledge_bases_organizationId_idx").on(table.organizationId),
  ]
);

export const chatbotKnowledgeBases = pgTable(
  "chatbot_knowledge_bases",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    chatbotId: text("chatbot_id")
      .notNull()
      .references(() => chatbots.id, { onDelete: "cascade" }),
    knowledgeBaseId: text("knowledge_base_id")
      .notNull()
      .references(() => knowledgeBases.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("chatbot_knowledge_bases_chatbotId_knowledgeBaseId_idx").on(
      table.chatbotId,
      table.knowledgeBaseId
    ),
    index("chatbot_knowledge_bases_organizationId_idx").on(
      table.organizationId
    ),
    index("chatbot_knowledge_bases_chatbotId_idx").on(table.chatbotId),
    index("chatbot_knowledge_bases_knowledgeBaseId_idx").on(
      table.knowledgeBaseId
    ),
  ]
);

export const documents = pgTable(
  "documents",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    knowledgeBaseId: text("knowledge_base_id")
      .notNull()
      .references(() => knowledgeBases.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sourceType: sourceTypeEnum("source_type").notNull(),
    sourceUrl: text("source_url"),
    status: documentStatusEnum("status").notNull().default("PROCESSING"),
    checksum: text("checksum").notNull(),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("documents_organizationId_idx").on(table.organizationId),
    index("documents_knowledgeBaseId_idx").on(table.knowledgeBaseId),
  ]
);

export const documentChunks = pgTable(
  "document_chunks",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    knowledgeBaseId: text("knowledge_base_id")
      .notNull()
      .references(() => knowledgeBases.id, { onDelete: "cascade" }),
    documentId: text("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
    sourceName: text("source_name").notNull(),
    sourceUrl: text("source_url"),
    pageNumber: integer("page_number"),
    section: text("section"),
    chunkIndex: integer("chunk_index").notNull(),
    version: integer("version").notNull().default(1),
    checksum: text("checksum").notNull(),
    metaData: json("meta_data").$type<KnowledgeChunkMeta>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("document_chunks_organizationId_idx").on(table.organizationId),
    index("document_chunks_knowledgeBaseId_idx").on(table.knowledgeBaseId),
    index("document_chunks_documentId_idx").on(table.documentId),
    index("document_chunks_embedding_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
);
