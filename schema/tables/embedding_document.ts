import {
  index,
  json,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  vector,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

import * as drz from "drizzle-orm/zod"
import z from "zod";



const embeddignDocumentFaqSchema = z.object({
  question: z.string(),
  answer: z.string(),
  topic: z.string()
}).default({
  question: "",
  answer: "",
  topic: ""
})

export const sourceTypeEnum = pgEnum("source_type", ["url", "docx", "pdf", "txt", "json"])

export const embeddingDocumentTable = pgTable(
  "embedding_document",
  {
    id: serial("id").primaryKey(),
    chunkIndex: serial("chunk_index").notNull(),
    source: text("source").notNull(),
    sourceType: sourceTypeEnum("source_type").notNull(),
    text: text("text").notNull(),
    metaData: json("meta_data").$type<z.infer<typeof embeddignDocumentFaqSchema>>().default(embeddignDocumentFaqSchema.def.defaultValue),
    embedding: vector("embedding", { dimensions: 1536 }),
    hash: text("hash").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("embedding_document_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
    index("embedding_document_text_search_idx").using(
      "gin",
      sql`to_tsvector('simple', ${table.text})`
    ),
  ]
)


export const EmbeddingDocumentSchema = {
  create: drz.createInsertSchema(embeddingDocumentTable, {
    metaData: embeddignDocumentFaqSchema.optional()
  }),
  select: drz.createSelectSchema(embeddingDocumentTable)
}


export type EmbeddingDocumentType = {
  create: z.infer<typeof EmbeddingDocumentSchema.create>
  select: typeof embeddingDocumentTable.$inferSelect
}
