import { streamRAGAgent } from "@/lib/rag-agent"
import { createUIMessageStreamResponse, pipeUIMessageStreamToResponse, toUIMessageStream, UIMessage } from "ai"
import { ServerResponse } from "http";
import { NextResponse, type NextRequest } from "next/server"

type ChatRequest = {
  id: string;
  lastMessage: string;
  messages: UIMessage[];

  enableQueryRewrite: boolean;
  vectorWeight: number;
  searchTopK: number;
  rerankTopK: number;
};

export async function POST(request: NextRequest, response: ServerResponse) {
  const body = await request.json() as ChatRequest

  console.log({ body })

  const {
    messages,
    lastMessage,
    enableQueryRewrite = true,
    vectorWeight = 0.7,
    searchTopK = 20,
    rerankTopK = 5,
  } = body


  if (!lastMessage || typeof lastMessage !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid 'question' field" },
      { status: 400 }
    )
  }

  try {
    const stream = await streamRAGAgent({
      lastMessage,
      conversationHistory: messages,
      enableQueryRewrite,
      vectorWeight,
      searchTopK,
      rerankTopK,
      signal: request.signal,
    })


    return pipeUIMessageStreamToResponse({
      response: response,
      stream: toUIMessageStream({ stream })
    })
  } catch (error) {
    console.error("[RAG API] Error:", error)
    return NextResponse.json(
      { error: "Failed to process your question" },
      { status: 500 }
    )
  }
}
