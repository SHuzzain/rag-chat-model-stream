"use server";

import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { chatbots } from "@/db/schema";
import { DEFAULT_CHATBOT_CONFIG } from "@/feature/chatbots/types";
import { canEditChatbots } from "@/lib/permissions";
import { requireOrgSession } from "@/lib/session";
import { getMembershipRole } from "@/feature/org/queries/org.queries";

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

  revalidatePath("/chatbots");
  return { id };
}
