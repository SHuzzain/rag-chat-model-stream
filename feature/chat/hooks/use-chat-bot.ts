"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

/**
 * Custom hook that wraps useChat with the RAG chatbot configuration.
 * Centralizes all chat state and actions.
 */
export function useChatBot() {
  const chat = useChat({
    transport: new DefaultChatTransport({
      api: "api/chat",
    }),
  });

  const isBusy = chat.status === "submitted" || chat.status === "streaming";

  const handleSendMessage = (text: string) => {
    chat.sendMessage(
      { text },
      {
        body: {
          lastMessage: text,
        },
      }
    );
  };

  return {
    messages: chat.messages,
    status: chat.status,
    isBusy,
    sendMessage: handleSendMessage,
    stop: chat.stop,
  };
}
