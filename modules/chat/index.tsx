"use client";

import { Card } from "@/components/ui/card";
import { MessageScrollerProvider } from "@/components/ui/message-scroller";

import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { useChatBot } from "./use-chat-bot";

/**
 * Main ChatBot component — composes header, messages, and input.
 * All chat state is managed by the useChatBot hook.
 */
export function ChatBot() {
  const { messages, status, isBusy, sendMessage, stop } = useChatBot();

  return (
    <MessageScrollerProvider>
      <div className="relative flex flex-col gap-4">
        <Card className="mx-auto h-[calc(100dvh-2rem)] w-full max-w-2xl gap-0">
          <ChatHeader disabled={isBusy} />
          <ChatMessages messages={messages} isBusy={isBusy} />
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
