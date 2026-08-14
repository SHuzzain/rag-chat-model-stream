import { and, count, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { conversations, modelUsageEvents } from "@/db/schema";
import { requireOrgSession } from "@/lib/session";

export async function getUsageSummary(chatbotId?: string) {
  const { organizationId } = await requireOrgSession();

  const usageFilter = chatbotId
    ? and(
        eq(modelUsageEvents.organizationId, organizationId),
        eq(modelUsageEvents.chatbotId, chatbotId)
      )
    : eq(modelUsageEvents.organizationId, organizationId);

  const conversationFilter = chatbotId
    ? and(
        eq(conversations.organizationId, organizationId),
        eq(conversations.chatbotId, chatbotId)
      )
    : eq(conversations.organizationId, organizationId);

  const [usage] = await db
    .select({
      events: count(),
      inputTokens: sql<number>`coalesce(sum(${modelUsageEvents.inputTokens}), 0)`,
      outputTokens: sql<number>`coalesce(sum(${modelUsageEvents.outputTokens}), 0)`,
      totalTokens: sql<number>`coalesce(sum(${modelUsageEvents.totalTokens}), 0)`,
      providerCost: sql<number>`coalesce(sum(${modelUsageEvents.providerCost}), 0)`,
      customerCost: sql<number>`coalesce(sum(${modelUsageEvents.customerCost}), 0)`,
      avgLatency: sql<number>`coalesce(avg(${modelUsageEvents.latencyMs}), 0)`,
    })
    .from(modelUsageEvents)
    .where(usageFilter);

  const [conversationStats] = await db
    .select({ total: count() })
    .from(conversations)
    .where(conversationFilter);

  return {
    conversations: Number(conversationStats?.total ?? 0),
    events: Number(usage?.events ?? 0),
    inputTokens: Number(usage?.inputTokens ?? 0),
    outputTokens: Number(usage?.outputTokens ?? 0),
    totalTokens: Number(usage?.totalTokens ?? 0),
    providerCost: Number(usage?.providerCost ?? 0),
    customerCost: Number(usage?.customerCost ?? 0),
    avgLatency: Number(usage?.avgLatency ?? 0),
  };
}
