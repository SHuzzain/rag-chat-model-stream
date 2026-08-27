"use server";

import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath, updateTag } from "next/cache";

import { db } from "@/db";
import {
  chatbotDeployments,
  chatbotVersions,
  chatbots,
} from "@/db/schema";
import { chatbotCacheTags } from "@/feature/chatbots/cache-tag";
import type { ChatbotSnapshotConfig } from "@/feature/chatbots/types";
import { getMembershipRole } from "@/feature/org/actions/org.actions";
import { canPublish } from "@/lib/permissions";
import { requireOrgSession } from "@/lib/session";
import { createHash } from "@/lib/utils";

async function assertCanPublish() {
  const ctx = await requireOrgSession();
  const role = await getMembershipRole();
  if (!canPublish(role)) throw new Error("Forbidden");
  return ctx;
}

function toSnapshot(bot: typeof chatbots.$inferSelect): ChatbotSnapshotConfig {
  return {
    name: bot.name,
    description: bot.description ?? undefined,
    systemPrompt: bot.systemPrompt,
    modelProvider: bot.modelProvider,
    modelName: bot.modelName,
    temperature: bot.temperature,
    maxOutputTokens: bot.maxOutputTokens,
    welcomeMessage: bot.welcomeMessage ?? undefined,
    suggestedQuestions: bot.suggestedQuestions ?? [],
  };
}

export async function publishChatbotAction(chatbotId: string) {
  const { organizationId, user } = await assertCanPublish();
  const [bot] = await db
    .select()
    .from(chatbots)
    .where(
      and(eq(chatbots.id, chatbotId), eq(chatbots.organizationId, organizationId))
    )
    .limit(1);
  if (!bot) throw new Error("Chatbot not found");
  if (!bot.systemPrompt.trim()) throw new Error("System prompt is required");

  const nextVersion = (bot.publishedVersion ?? 0) + 1;
  const configuration = toSnapshot(bot);
  const checksum = createHash(JSON.stringify(configuration));

  await db.insert(chatbotVersions).values({
    id: nanoid(),
    chatbotId: bot.id,
    organizationId,
    version: nextVersion,
    configuration,
    checksum,
    publishedBy: user.id,
  });

  const [existing] = await db
    .select()
    .from(chatbotDeployments)
    .where(eq(chatbotDeployments.chatbotId, bot.id))
    .limit(1);

  if (!existing) {
    await db.insert(chatbotDeployments).values({
      id: nanoid(),
      chatbotId: bot.id,
      organizationId,
      publicBotId: nanoid(12),
      allowedDomains: [],
      status: "ACTIVE",
      createdBy: user.id,
    });
  }

  await db
    .update(chatbots)
    .set({
      isPublished: true,
      publishedVersion: nextVersion,
    })
    .where(eq(chatbots.id, bot.id));

  updateTag(chatbotCacheTags.list);
  updateTag(chatbotCacheTags.get(chatbotId));
  revalidatePath(`/chatbots/${chatbotId}`);
  revalidatePath("/chatbots");
}

export async function rollbackChatbotAction(chatbotId: string, version: number) {
  const { organizationId } = await assertCanPublish();
  const [snapshot] = await db
    .select()
    .from(chatbotVersions)
    .where(
      and(
        eq(chatbotVersions.chatbotId, chatbotId),
        eq(chatbotVersions.organizationId, organizationId),
        eq(chatbotVersions.version, version)
      )
    )
    .limit(1);
  if (!snapshot) throw new Error("Version not found");

  const config = snapshot.configuration;
  await db
    .update(chatbots)
    .set({
      name: config.name,
      description: config.description ?? null,
      systemPrompt: config.systemPrompt,
      modelProvider: config.modelProvider,
      modelName: config.modelName,
      temperature: config.temperature,
      maxOutputTokens: config.maxOutputTokens,
      welcomeMessage: config.welcomeMessage ?? null,
      suggestedQuestions: config.suggestedQuestions,
      isPublished: true,
      publishedVersion: version,
    })
    .where(
      and(eq(chatbots.id, chatbotId), eq(chatbots.organizationId, organizationId))
    );

  updateTag(chatbotCacheTags.list);
  updateTag(chatbotCacheTags.get(chatbotId));
  revalidatePath(`/chatbots/${chatbotId}`);
}

export async function updateDeploymentAction(formData: FormData) {
  const { organizationId } = await assertCanPublish();
  const chatbotId = String(formData.get("chatbotId") ?? "");
  const domains = String(formData.get("allowedDomains") ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const rateLimitPerMinute = Number(formData.get("rateLimitPerMinute") ?? 60);

  await db
    .update(chatbotDeployments)
    .set({
      allowedDomains: domains,
      rateLimitPerMinute,
    })
    .where(
      and(
        eq(chatbotDeployments.chatbotId, chatbotId),
        eq(chatbotDeployments.organizationId, organizationId)
      )
    );

  updateTag(chatbotCacheTags.list);
  updateTag(chatbotCacheTags.get(chatbotId));
  revalidatePath(`/chatbots/${chatbotId}`);
}
