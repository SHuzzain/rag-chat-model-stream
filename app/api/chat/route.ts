import { streamRAGAgent } from "@/lib/rag-agent"
import { createUIMessageStreamResponse, toUIMessageStream, UIMessage } from "ai"
import { NextResponse, type NextRequest } from "next/server"

type ChatRequest = {
  id: string
  lastMessage: string
  messages: UIMessage[]
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as ChatRequest

  const { messages, lastMessage } = body

  if (!lastMessage || typeof lastMessage !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid 'lastMessage' field" },
      { status: 400 }
    )
  }

  try {
    const stream = await streamRAGAgent({
      lastMessage,
      conversationHistory: messages,
      signal: request.signal,
    })

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream }),
    })
  } catch (error) {
    console.error("[RAG API] Error:", error)
    return NextResponse.json(
      { error: "Failed to process your question" },
      { status: 500 }
    )
  }
}
