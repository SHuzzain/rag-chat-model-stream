import { type NextRequest, NextResponse } from "next/server";

import type { UIMessage } from "ai";

import { createChatStreamResponse } from "@/feature/chat/actions/chat.actions";

type ChatRequest = {
  id: string;
  lastMessage: string;
  messages: UIMessage[];
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as ChatRequest;
  const { messages, lastMessage } = body;

  if (!lastMessage || typeof lastMessage !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid 'lastMessage' field" },
      { status: 400 }
    );
  }

  try {
    return createChatStreamResponse({
      lastMessage,
      messages,
      signal: request.signal,
    });
  } catch (error) {
    console.error("[RAG API] Error:", error);
    return NextResponse.json(
      { error: "Failed to process your question" },
      { status: 500 }
    );
  }
}
