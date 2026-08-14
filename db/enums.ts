import { pgEnum } from "drizzle-orm/pg-core";

export const sourceTypeEnum = pgEnum("source_type", [
  "url",
  "docx",
  "pdf",
  "txt",
  "json",
  "csv",
  "xlsx",
]);

export const documentStatusEnum = pgEnum("document_status", [
  "PENDING",
  "PROCESSING",
  "READY",
  "FAILED",
]);

export const deploymentStatusEnum = pgEnum("deployment_status", [
  "ACTIVE",
  "DISABLED",
]);

export const conversationStatusEnum = pgEnum("conversation_status", [
  "ACTIVE",
  "ENDED",
]);

export const usageStatusEnum = pgEnum("usage_status", ["SUCCESS", "FAILED"]);
