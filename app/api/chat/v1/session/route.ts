import { NextResponse, type NextRequest } from "next/server";
import { nanoid } from "nanoid";

import { createConversation } from "@/feature/chat/actions/persist";
import { isOriginAllowed } from "@/feature/chat/lib/origin";
import { getPublishedRuntimeByPublicId } from "@/feature/chatbots/queries/chatbots.queries";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { publicBotId?: string };
  const publicBotId = body.publicBotId;
  if (!publicBotId) {
    return NextResponse.json({ error: "Missing publicBotId" }, { status: 400 });
  }

  const runtime = await getPublishedRuntimeByPublicId(publicBotId);
  if (!runtime) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  }

  if (!isOriginAllowed(request, runtime.deployment.allowedDomains)) {
    return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
  }

  const conversationId = await createConversation({
    chatbotId: runtime.bot.id,
    organizationId: runtime.bot.organizationId,
    sessionKey: nanoid(),
  });

  return NextResponse.json({
    conversationId,
    name: runtime.snapshot.name,
    welcomeMessage: runtime.snapshot.welcomeMessage,
    suggestedQuestions: runtime.snapshot.suggestedQuestions,
  });
}
