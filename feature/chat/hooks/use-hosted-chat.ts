"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo } from "react";

export function useHostedChat({
  publicBotId,
  conversationId,
}: {
  publicBotId: string;
  conversationId: string;
}) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat/v1/messages",
      }),
    []
  );

  const chat = useChat({
    transport,
  });

  const isBusy = chat.status === "submitted" || chat.status === "streaming";

  const sendMessage = (text: string) => {
    chat.sendMessage(
      { text },
      {
        body: {
          lastMessage: text,
          publicBotId,
          conversationId,
        },
      }
    );
  };

  return {
    messages: chat.messages,
    status: chat.status,
    isBusy,
    sendMessage,
    stop: chat.stop,
  };
}
