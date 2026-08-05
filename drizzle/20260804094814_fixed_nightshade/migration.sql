CREATE TYPE "source_type" AS ENUM('url', 'docx', 'pdf', 'txt', 'json');--> statement-breakpoint
CREATE TABLE "embedding_document" (
	"id" serial PRIMARY KEY,
	"chunk_index" serial,
	"source" text NOT NULL,
	"source_type" "source_type" NOT NULL,
	"text" text NOT NULL,
	"meta_data" json DEFAULT '{"question":"","answer":"","topic":""}',
	"embedding" vector(1536),
	"hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "embedding_document_idx" ON "embedding_document" USING hnsw ("embedding" vector_cosine_ops);