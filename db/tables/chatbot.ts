import {
  boolean,
  index,
  integer,
  json,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import type { ChatbotSnapshotConfig } from "@/feature/chatbots/types";

import { deploymentStatusEnum } from "../enums";
import { organization } from "./organization";
import { user } from "./user";

export const chatbots = pgTable(
  "chatbots",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    systemPrompt: text("system_prompt").notNull(),
    modelProvider: text("model_provider").notNull().default("openai"),
    modelName: text("model_name").notNull().default("gpt-4o-mini"),
    temperature: real("temperature").notNull().default(0.7),
    maxOutputTokens: integer("max_output_tokens").notNull().default(1024),
    welcomeMessage: text("welcome_message"),
    suggestedQuestions: json("suggested_questions")
      .$type<string[]>()
      .notNull()
      .default([]),
    isPublished: boolean("is_published").notNull().default(false),
    publishedVersion: integer("published_version"),
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
    index("chatbots_organizationId_idx").on(table.organizationId),
    index("chatbots_createdBy_idx").on(table.createdBy),
  ]
);

export const chatbotVersions = pgTable(
  "chatbot_versions",
  {
    id: text("id").primaryKey(),
    chatbotId: text("chatbot_id")
      .notNull()
      .references(() => chatbots.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    configuration: json("configuration")
      .$type<ChatbotSnapshotConfig>()
      .notNull(),
    checksum: text("checksum").notNull(),
    publishedBy: text("published_by").references(() => user.id, {
      onDelete: "set null",
    }),
    publishedAt: timestamp("published_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("chatbot_versions_chatbotId_idx").on(table.chatbotId),
    index("chatbot_versions_organizationId_idx").on(table.organizationId),
  ]
);

export const chatbotDeployments = pgTable(
  "chatbot_deployments",
  {
    id: text("id").primaryKey(),
    chatbotId: text("chatbot_id")
      .notNull()
      .references(() => chatbots.id, { onDelete: "cascade" })
      .unique(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    publicBotId: text("public_bot_id").notNull().unique(),
    allowedDomains: json("allowed_domains").$type<string[]>().notNull().default([]),
    rateLimitPerMinute: integer("rate_limit_per_minute").notNull().default(60),
    status: deploymentStatusEnum("status").notNull().default("ACTIVE"),
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
    index("chatbot_deployments_organizationId_idx").on(table.organizationId),
    index("chatbot_deployments_publicBotId_idx").on(table.publicBotId),
  ]
);
