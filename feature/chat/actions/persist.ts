import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db } from "@/db";
import { conversations, messages, modelUsageEvents } from "@/db/schema";

export async function createConversation({
  chatbotId,
  organizationId,
  sessionKey,
}: {
  chatbotId: string;
  organizationId: string;
  sessionKey: string;
}) {
  const id = nanoid();
  await db.insert(conversations).values({
    id,
    chatbotId,
    organizationId,
    sessionKey,
    status: "ACTIVE",
  });
  return id;
}

export async function getConversation(id: string) {
  const [row] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .limit(1);
  return row ?? null;
}

export async function saveMessage({
  conversationId,
  role,
  content,
}: {
  conversationId: string;
  role: string;
  content: string;
}) {
  const id = nanoid();
  await db.insert(messages).values({
    id,
    conversationId,
    role,
    content,
  });
  return id;
}

export function estimateModelCost(inputTokens: number, outputTokens: number) {
  const providerCost =
    (inputTokens * 0.15 + outputTokens * 0.6) / 1_000_000;
  return { providerCost, customerCost: providerCost };
}

export async function saveUsageEvent(input: {
  organizationId: string;
  chatbotId: string;
  conversationId?: string;
  messageId?: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  status: "SUCCESS" | "FAILED";
}) {
  const totalTokens = input.inputTokens + input.outputTokens;
  const { providerCost, customerCost } = estimateModelCost(
    input.inputTokens,
    input.outputTokens
  );
  await db.insert(modelUsageEvents).values({
    id: nanoid(),
    organizationId: input.organizationId,
    chatbotId: input.chatbotId,
    conversationId: input.conversationId,
    messageId: input.messageId,
    provider: input.provider,
    model: input.model,
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    totalTokens,
    providerCost,
    customerCost,
    latencyMs: input.latencyMs,
    status: input.status,
  });
}
