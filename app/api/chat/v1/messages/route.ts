import { type NextRequest, NextResponse } from "next/server";

import type { UIMessage } from "ai";

import { createChatStreamResponse } from "@/feature/chat/actions/chat.actions";
import { getConversation } from "@/feature/chat/actions/persist.actions";
import { isOriginAllowed } from "@/feature/chat/lib/origin";
import { getPublishedRuntimeByPublicId } from "@/feature/chatbots/actions/chatbots.actions";

type ChatRequest = {
  lastMessage?: string;
  messages?: UIMessage[];
  publicBotId?: string;
  conversationId?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as ChatRequest;
  const { lastMessage, messages = [], publicBotId, conversationId } = body;

  if (!lastMessage || !publicBotId || !conversationId) {
    return NextResponse.json(
      { error: "Missing lastMessage, publicBotId, or conversationId" },
      { status: 400 }
    );
  }

  const runtime = await getPublishedRuntimeByPublicId(publicBotId);
  if (!runtime) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  }

  if (!isOriginAllowed(request, runtime.deployment.allowedDomains)) {
    return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
  }

  const conversation = await getConversation(conversationId);
  if (!conversation || conversation.chatbotId !== runtime.bot.id) {
    return NextResponse.json({ error: "Invalid conversation" }, { status: 400 });
  }

  try {
    return createChatStreamResponse({
      lastMessage,
      messages,
      signal: request.signal,
      snapshot: runtime.snapshot,
      organizationId: runtime.bot.organizationId,
      chatbotId: runtime.bot.id,
      conversationId,
    });
  } catch (error) {
    console.error("[chat/v1] Error:", error);
    return NextResponse.json(
      { error: "Failed to process your question" },
      { status: 500 }
    );
  }
}
