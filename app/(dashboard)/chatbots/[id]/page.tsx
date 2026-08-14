import { notFound } from "next/navigation";

import { ChatbotBuilderView } from "@/feature/chatbots/components/chatbot-builder-view";
import { getChatbotWithDeployment } from "@/feature/chatbots/queries/chatbots.queries";
import {
  listAttachedDocuments,
  listUnattachedKnowledge,
} from "@/feature/knowledge/queries/knowledge.queries";
import { getMembershipRole } from "@/feature/org/queries/org.queries";
import { canEditChatbots, canPublish } from "@/lib/permissions";

export default async function ChatbotBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getChatbotWithDeployment(id);
  if (!data) notFound();
  const role = await getMembershipRole();
  const documents = await listAttachedDocuments(id);
  const availableKnowledge = await listUnattachedKnowledge(id);

  return (
    <ChatbotBuilderView
      bot={data.bot}
      deployment={data.deployment}
      versions={data.versions}
      documents={documents}
      availableKnowledge={availableKnowledge}
      canPublish={canPublish(role)}
      canEdit={canEditChatbots(role)}
    />
  );
}
