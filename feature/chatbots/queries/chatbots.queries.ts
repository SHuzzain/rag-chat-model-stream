import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  chatbotDeployments,
  chatbotVersions,
  chatbots,
} from "@/db/schema";
import { requireOrgSession } from "@/lib/session";

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
