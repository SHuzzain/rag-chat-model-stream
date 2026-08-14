"use client";

import { Card } from "@/components/ui/card";
import { MessageScrollerProvider } from "@/components/ui/message-scroller";

import { useHostedChat } from "../hooks/use-hosted-chat";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatMessages } from "./chat-messages";
import { ChatSuggestions } from "./chat-suggestions";

export function HostedChatView({
  publicBotId,
  conversationId,
  name,
  welcomeMessage,
  suggestedQuestions,
}: {
  publicBotId: string;
  conversationId: string;
  name: string;
  welcomeMessage?: string;
  suggestedQuestions: string[];
}) {
  const { messages, status, isBusy, sendMessage, stop } = useHostedChat({
    publicBotId,
    conversationId,
  });

  return (
    <MessageScrollerProvider>
      <div className="relative flex flex-col gap-4 p-4">
        <Card className="mx-auto h-[calc(100dvh-2rem)] w-full max-w-2xl gap-0">
          <ChatHeader disabled={isBusy} title={name} subtitle={welcomeMessage} />
          <ChatMessages messages={messages} isBusy={isBusy} />
          <ChatSuggestions
            messages={messages}
            isBusy={isBusy}
            onSendMessage={sendMessage}
            defaultSuggestions={suggestedQuestions}
          />
          <ChatInput
            status={status}
            isBusy={isBusy}
            onSendMessage={sendMessage}
            onStop={stop}
          />
        </Card>
      </div>
    </MessageScrollerProvider>
  );
}
