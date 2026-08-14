import {
  UIMessage,
  createUIMessageStream,
  createUIMessageStreamResponse,
  toUIMessageStream,
} from "ai";

import { streamRAGAgent } from "@/feature/chat/agents/rag-agent";
import { generateSuggestions } from "@/feature/chat/actions/suggestion.actions";
import { saveMessage, saveUsageEvent } from "@/feature/chat/actions/persist";
import { DEFAULT_SYSTEM_PROMPT } from "@/feature/chatbots/types";
import type { ChatbotSnapshotConfig } from "@/feature/chatbots/types";

export type ChatStreamInput = {
  lastMessage: string;
  messages: UIMessage[];
  signal?: AbortSignal;
  snapshot?: ChatbotSnapshotConfig;
  organizationId?: string;
  chatbotId?: string;
  conversationId?: string;
};

export function createChatStreamResponse({
  lastMessage,
  messages,
  signal,
  snapshot,
  organizationId,
  chatbotId,
  conversationId,
}: ChatStreamInput) {
  const config = snapshot ?? {
    name: "Playground",
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    modelProvider: "openai",
    modelName: "gpt-4o-mini",
    temperature: 0.7,
    maxOutputTokens: 1024,
    suggestedQuestions: [],
  };

  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      execute: async ({ writer }) => {
        const started = Date.now();
        if (conversationId) {
          await saveMessage({
            conversationId,
            role: "user",
            content: lastMessage,
          });
        }

        const result = await streamRAGAgent({
          lastMessage,
          conversationHistory: messages,
          signal,
          systemPrompt: config.systemPrompt,
          modelName: config.modelName,
          temperature: config.temperature,
          maxOutputTokens: config.maxOutputTokens,
          chatbotId,
          organizationId,
        });

        writer.merge(toUIMessageStream({ stream: result.stream }));

        const answer = await result.text;
        let inputTokens = 0;
        let outputTokens = 0;
        try {
          const usage = await result.usage;
          inputTokens = usage.inputTokens ?? 0;
          outputTokens = usage.outputTokens ?? 0;
        } catch {
          inputTokens = 0;
          outputTokens = 0;
        }

        if (conversationId && answer) {
          const messageId = await saveMessage({
            conversationId,
            role: "assistant",
            content: answer,
          });
          if (organizationId && chatbotId) {
            await saveUsageEvent({
              organizationId,
              chatbotId,
              conversationId,
              messageId,
              provider: config.modelProvider,
              model: config.modelName,
              inputTokens,
              outputTokens,
              latencyMs: Date.now() - started,
              status: "SUCCESS",
            });
          }
        }

        if (answer && answer.trim().length > 0) {
          try {
            writer.write({
              type: "data-suggestions-loading",
              data: "loading",
            });
            const suggestions = await generateSuggestions(lastMessage, answer, {
              chatbotId,
              organizationId,
            });
            writer.write({
              type: "data-suggestions",
              data: suggestions,
            });
          } catch (err) {
            console.error("[RAG API] Error generating suggestions:", err);
          }
        }
      },
    }),
  });
}
