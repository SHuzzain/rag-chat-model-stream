"use client";

import { Card } from "@/components/ui/card";
import { MessageScrollerProvider } from "@/components/ui/message-scroller";

import { useChatBot } from "../hooks/use-chat-bot";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatMessages } from "./chat-messages";
import { ChatSuggestions } from "./chat-suggestions";

/**
 * Main chat view — composes header, messages, and input.
 * All chat state is managed by the useChatBot hook.
 */
export function ChatView() {
  const { messages, status, isBusy, sendMessage, stop } = useChatBot();

  return (
    <MessageScrollerProvider>
      <div className="relative flex flex-col gap-4">
        <Card className="mx-auto h-[calc(100dvh-2rem)] w-full max-w-2xl gap-0">
          <ChatHeader disabled={isBusy} />
          <ChatMessages messages={messages} isBusy={isBusy} />
          <ChatSuggestions
            messages={messages}
            isBusy={isBusy}
            onSendMessage={sendMessage}
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
