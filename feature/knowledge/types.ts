export type ChunkDraft = {
  content: string;
  checksum: string;
  chunkIndex: number;
  sourceName: string;
  sourceUrl?: string;
  section?: string;
  metaData?: Record<string, unknown>;
};

export type KnowledgeFileType = "json" | "pdf" | "csv" | "xlsx" | "docx";

export type LibraryDocument = {
  id: string;
  knowledgeBaseId: string;
  name: string;
  sourceType: string;
  sourceUrl: string | null;
  status: string;
  createdAt: Date;
};

export type AttachableKnowledge = {
  knowledgeBaseId: string;
  name: string;
};
