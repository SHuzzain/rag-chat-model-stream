import { notFound } from "next/navigation";

import { ChatbotBuilderView } from "@/feature/chatbots/components/chatbot-builder-view";
import { getChatbotWithDeployment } from "@/feature/chatbots/actions/chatbots.actions";
import {
  listAttachedDocuments,
  listUnattachedKnowledge,
} from "@/feature/knowledge/actions/knowledge.actions";
import { getMembershipRole } from "@/feature/org/actions/org.actions";
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
