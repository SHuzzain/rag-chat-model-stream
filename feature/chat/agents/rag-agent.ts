import { openai } from "@ai-sdk/openai";
import { UIMessage, isStepCount, streamText } from "ai";

import { buildRAGMessages } from "../prompt/prompt-builder";
import { createAllTools } from "../tools";

export type RAGAgentOptions = {
  lastMessage: string;
  conversationHistory?: UIMessage[];
  signal?: AbortSignal;
  systemPrompt: string;
  modelName?: string;
  temperature?: number;
  maxOutputTokens?: number;
  chatbotId?: string;
  organizationId?: string;
};

export async function streamRAGAgent({
  lastMessage,
  conversationHistory,
  signal,
  systemPrompt,
  modelName = "gpt-4o-mini",
  temperature = 0.7,
  maxOutputTokens = 1024,
  chatbotId,
  organizationId,
}: RAGAgentOptions) {
  const messages = await buildRAGMessages({
    lastMessage,
    conversationHistory,
    systemPrompt,
  });

  return streamText({
    model: openai(modelName),
    system: messages.system,
    messages: messages.messages,
    temperature,
    maxOutputTokens,
    tools: createAllTools({ chatbotId, organizationId }),
    abortSignal: signal,
    onAbort: ({ steps }) => {
      console.log("Stream aborted after", steps.length, "steps");
    },
    stopWhen: isStepCount(3),
  });
}
