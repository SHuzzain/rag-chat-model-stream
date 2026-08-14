import { notFound } from "next/navigation";
import { nanoid } from "nanoid";

import { HostedChatView } from "@/feature/chat/components/hosted-chat-view";
import { createConversation } from "@/feature/chat/actions/persist";
import { getPublishedRuntimeByPublicId } from "@/feature/chatbots/queries/chatbots.queries";

export default async function HostedBotPage({
  params,
}: {
  params: Promise<{ publicBotId: string }>;
}) {
  const { publicBotId } = await params;
  const runtime = await getPublishedRuntimeByPublicId(publicBotId);
  if (!runtime) notFound();

  const conversationId = await createConversation({
    chatbotId: runtime.bot.id,
    organizationId: runtime.bot.organizationId,
    sessionKey: nanoid(),
  });

  return (
    <HostedChatView
      publicBotId={publicBotId}
      conversationId={conversationId}
      name={runtime.snapshot.name}
      welcomeMessage={runtime.snapshot.welcomeMessage}
      suggestedQuestions={runtime.snapshot.suggestedQuestions}
    />
  );
}
