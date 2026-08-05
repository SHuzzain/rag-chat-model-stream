"use client";

import { MessageCircleDashedIcon } from "lucide-react";
import { UIMessage } from "ai";

import { MessageAnimated } from "@/components/message-animated";
import { CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";

interface ChatMessagesProps {
  messages: UIMessage[];
  isBusy: boolean;
}

export function ChatMessages({ messages, isBusy }: ChatMessagesProps) {
  return (
    <CardContent className="flex-1 overflow-hidden p-0">
      {messages.length === 0 ? (
        <Empty className="h-full">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageCircleDashedIcon />
            </EmptyMedia>
            <EmptyTitle>Welcome!</EmptyTitle>
            <EmptyDescription>
              Ask me anything about our knowledge base. Type your question
              below to get started.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent
              aria-busy={isBusy}
              className="p-(--card-spacing)"
            >
              {messages.map((message) => (
                <MessageAnimated
                  key={message.id}
                  message={message}
                  scrollAnchor={message.role === "user"}
                />
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      )}
    </CardContent>
  );
}
