"use server";

import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import {
  chatbotDeployments,
  chatbotVersions,
  chatbots,
} from "@/db/schema";
import { chatbotCacheTags } from "@/feature/chatbots/cache-tag";
import { DEFAULT_CHATBOT_CONFIG } from "@/feature/chatbots/types";
import { getMembershipRole } from "@/feature/org/actions/org.actions";
import { canEditChatbots } from "@/lib/permissions";
import { requireOrgSession } from "@/lib/session";

async function assertCanEdit() {
  const ctx = await requireOrgSession();
  const role = await getMembershipRole();
  if (!canEditChatbots(role)) throw new Error("Forbidden");
  return ctx;
}

export async function createChatbotAction(formData: FormData) {
  const { organizationId, user } = await assertCanEdit();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");

  const id = nanoid();
  await db.insert(chatbots).values({
    id,
    organizationId,
    name,
    description: String(formData.get("description") ?? "").trim() || null,
    systemPrompt: DEFAULT_CHATBOT_CONFIG.systemPrompt,
    modelProvider: DEFAULT_CHATBOT_CONFIG.modelProvider,
    modelName: DEFAULT_CHATBOT_CONFIG.modelName,
    temperature: DEFAULT_CHATBOT_CONFIG.temperature,
    maxOutputTokens: DEFAULT_CHATBOT_CONFIG.maxOutputTokens,
    welcomeMessage: DEFAULT_CHATBOT_CONFIG.welcomeMessage,
    suggestedQuestions: DEFAULT_CHATBOT_CONFIG.suggestedQuestions,
    createdBy: user.id,
  });

  updateTag(chatbotCacheTags.list);
  updateTag(chatbotCacheTags.get(id));
  revalidatePath("/chatbots");
  redirect(`/chatbots/${id}`);
}

export async function updateChatbotAction(formData: FormData) {
  const { organizationId } = await assertCanEdit();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing chatbot id");

  const [current] = await db
    .select()
    .from(chatbots)
    .where(and(eq(chatbots.id, id), eq(chatbots.organizationId, organizationId)))
    .limit(1);
  if (!current) throw new Error("Chatbot not found");

  const suggestedRaw = formData.get("suggestedQuestions");
  const suggestedQuestions =
    suggestedRaw == null
      ? current.suggestedQuestions
      : String(suggestedRaw)
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);

  await db
    .update(chatbots)
    .set({
      name: formData.has("name")
        ? String(formData.get("name") ?? "").trim() || current.name
        : current.name,
      description: formData.has("description")
        ? String(formData.get("description") ?? "").trim() || null
        : current.description,
      systemPrompt: formData.has("systemPrompt")
        ? String(formData.get("systemPrompt") ?? "")
        : current.systemPrompt,
      modelProvider: formData.has("modelProvider")
        ? String(formData.get("modelProvider") ?? "openai")
        : current.modelProvider,
      modelName: formData.has("modelName")
        ? String(formData.get("modelName") ?? "gpt-4o-mini")
        : current.modelName,
      temperature: formData.has("temperature")
        ? Number(formData.get("temperature") ?? current.temperature)
        : current.temperature,
      maxOutputTokens: formData.has("maxOutputTokens")
        ? Number(formData.get("maxOutputTokens") ?? current.maxOutputTokens)
        : current.maxOutputTokens,
      welcomeMessage: formData.has("welcomeMessage")
        ? String(formData.get("welcomeMessage") ?? "").trim() || null
        : current.welcomeMessage,
      suggestedQuestions,
    })
    .where(and(eq(chatbots.id, id), eq(chatbots.organizationId, organizationId)));

  updateTag(chatbotCacheTags.list);
  updateTag(chatbotCacheTags.get(id));
  revalidatePath(`/chatbots/${id}`);
  revalidatePath("/chatbots");
}

export async function duplicateChatbotAction(chatbotId: string) {
  const { organizationId, user } = await assertCanEdit();
  const [source] = await db
    .select()
    .from(chatbots)
    .where(
      and(eq(chatbots.id, chatbotId), eq(chatbots.organizationId, organizationId))
    )
    .limit(1);
  if (!source) throw new Error("Chatbot not found");

  const id = nanoid();
  await db.insert(chatbots).values({
    id,
    organizationId,
    name: `${source.name} copy`,
    description: source.description,
    systemPrompt: source.systemPrompt,
    modelProvider: source.modelProvider,
    modelName: source.modelName,
    temperature: source.temperature,
    maxOutputTokens: source.maxOutputTokens,
    welcomeMessage: source.welcomeMessage,
    suggestedQuestions: source.suggestedQuestions,
    isPublished: false,
    publishedVersion: null,
    createdBy: user.id,
  });

  updateTag(chatbotCacheTags.list);
  updateTag(chatbotCacheTags.get(id));
  revalidatePath("/chatbots");
  return { id };
}

export async function listChatbots() {
  const { organizationId } = await requireOrgSession();
  return db
    .select()
    .from(chatbots)
    .where(eq(chatbots.organizationId, organizationId))
    .orderBy(desc(chatbots.updatedAt));
}

export async function getChatbot(id: string) {
  const { organizationId } = await requireOrgSession();
  const [bot] = await db
    .select()
    .from(chatbots)
    .where(and(eq(chatbots.id, id), eq(chatbots.organizationId, organizationId)))
    .limit(1);
  return bot ?? null;
}

export async function getChatbotWithDeployment(id: string) {
  const bot = await getChatbot(id);
  if (!bot) return null;
  const [deployment] = await db
    .select()
    .from(chatbotDeployments)
    .where(eq(chatbotDeployments.chatbotId, bot.id))
    .limit(1);
  const versions = await db
    .select()
    .from(chatbotVersions)
    .where(eq(chatbotVersions.chatbotId, bot.id))
    .orderBy(desc(chatbotVersions.version));
  return { bot, deployment: deployment ?? null, versions };
}

export async function getPublishedRuntimeByPublicId(publicBotId: string) {
  const [deployment] = await db
    .select()
    .from(chatbotDeployments)
    .where(eq(chatbotDeployments.publicBotId, publicBotId))
    .limit(1);

  if (!deployment || deployment.status !== "ACTIVE") return null;

  const [bot] = await db
    .select()
    .from(chatbots)
    .where(eq(chatbots.id, deployment.chatbotId))
    .limit(1);

  if (!bot?.isPublished || !bot.publishedVersion) return null;

  const [version] = await db
    .select()
    .from(chatbotVersions)
    .where(
      and(
        eq(chatbotVersions.chatbotId, bot.id),
        eq(chatbotVersions.version, bot.publishedVersion)
      )
    )
    .limit(1);

  if (!version) return null;

  return { bot, deployment, snapshot: version.configuration };
}
