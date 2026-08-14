import {
  index,
  integer,
  json,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { conversationStatusEnum, usageStatusEnum } from "../enums";
import { chatbotDeployments, chatbots } from "./chatbot";
import { organization } from "./organization";

export const conversations = pgTable(
  "conversations",
  {
    id: text("id").primaryKey(),
    chatbotId: text("chatbot_id")
      .notNull()
      .references(() => chatbots.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    sessionKey: text("session_key").notNull(),
    externalUserId: text("external_user_id"),
    status: conversationStatusEnum("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("conversations_chatbotId_idx").on(table.chatbotId),
    index("conversations_organizationId_idx").on(table.organizationId),
    index("conversations_sessionKey_idx").on(table.sessionKey),
  ]
);

export const messages = pgTable(
  "messages",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    content: text("content").notNull(),
    parts: json("parts").$type<unknown>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("messages_conversationId_idx").on(table.conversationId)]
);

export const modelUsageEvents = pgTable(
  "model_usage_events",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    chatbotId: text("chatbot_id")
      .notNull()
      .references(() => chatbots.id, { onDelete: "cascade" }),
    conversationId: text("conversation_id").references(() => conversations.id, {
      onDelete: "set null",
    }),
    messageId: text("message_id").references(() => messages.id, {
      onDelete: "set null",
    }),
    deploymentId: text("deployment_id").references(
      () => chatbotDeployments.id,
      { onDelete: "set null" }
    ),
    provider: text("provider").notNull(),
    model: text("model").notNull(),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    totalTokens: integer("total_tokens").notNull().default(0),
    providerCost: real("provider_cost").notNull().default(0),
    customerCost: real("customer_cost").notNull().default(0),
    currency: text("currency").notNull().default("USD"),
    latencyMs: integer("latency_ms").notNull().default(0),
    status: usageStatusEnum("status").notNull().default("SUCCESS"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("model_usage_events_organizationId_idx").on(table.organizationId),
    index("model_usage_events_chatbotId_idx").on(table.chatbotId),
  ]
);
