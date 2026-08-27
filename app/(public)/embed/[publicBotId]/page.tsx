import { notFound } from "next/navigation";
import { nanoid } from "nanoid";

import { HostedChatView } from "@/feature/chat/components/hosted-chat-view";
import { createConversation } from "@/feature/chat/actions/persist.actions";
import { getPublishedRuntimeByPublicId } from "@/feature/chatbots/actions/chatbots.actions";

export default async function EmbedBotPage({
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
    <div className="h-svh overflow-hidden bg-background">
      <HostedChatView
        publicBotId={publicBotId}
        conversationId={conversationId}
        name={runtime.snapshot.name}
        welcomeMessage={runtime.snapshot.welcomeMessage}
        suggestedQuestions={runtime.snapshot.suggestedQuestions}
      />
    </div>
  );
}
