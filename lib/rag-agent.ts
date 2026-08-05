import { streamText, isStepCount, UIMessage } from "ai"
import { openai } from "@ai-sdk/openai"
import { buildRAGMessages } from "./prompt-builder"
import { createAllTools } from "./tools"

export type RAGAgentOptions = {
  lastMessage: string
  conversationHistory?: UIMessage[]
  signal?: AbortSignal
}


export async function streamRAGAgent({
  lastMessage,
  conversationHistory,
  signal,
}: RAGAgentOptions) {
  const messages = await buildRAGMessages({
    lastMessage,
    conversationHistory,
  })

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: messages.system,
    messages: messages.messages,
    tools: createAllTools(),
    abortSignal: signal,
    onAbort: ({ steps }) => {
      console.log("Stream aborted after", steps.length, "steps")
    },
    stopWhen: isStepCount(3),
  })

  return result
}
