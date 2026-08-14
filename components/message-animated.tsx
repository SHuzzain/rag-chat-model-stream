"use client";

import * as React from "react";

import { UIMessage } from "ai";
import { SparklesIcon, UserIcon, WrenchIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message";
import { MessageScrollerItem } from "@/components/ui/message-scroller";
import { Spinner } from "@/components/ui/spinner";
import { getMessageText } from "@/lib/ai";

import { MemoizedMarkdown } from "./memoized-markdown";

export interface MessageAnimatedProps extends React.ComponentProps<
  typeof MessageScrollerItem
> {
  message: UIMessage;
  scrollAnchor?: boolean;
}

function getToolParts(message: UIMessage) {
  return message.parts.filter(
    (part) => typeof part.type === "string" && part.type.startsWith("tool-")
  );
}

function getRunningTool(message: UIMessage) {
  return getToolParts(message).find((part) => {
    if (!("state" in part)) return false;

    return part.state === "input-streaming" || part.state === "input-available";
  });
}

export function MessageAnimated({
  message,
  scrollAnchor = false,
  className,
  ...props
}: MessageAnimatedProps) {
  const isUser = message.role === "user";
  const text = getMessageText(message);

  const runningTool = !isUser ? getRunningTool(message) : undefined;

  const toolName = runningTool?.type.replace(/^tool-/, "");

  return (
    <MessageScrollerItem
      scrollAnchor={scrollAnchor}
      className={className}
      {...props}
    >
      <Message align={isUser ? "end" : "start"}>
        <MessageContent>
          {runningTool && (
            <Marker role="status">
              <MarkerIcon>
                <Spinner />
              </MarkerIcon>

              <MarkerContent className="flex items-center gap-2">
                <WrenchIcon className="size-3" />
                Running <strong>{toolName}</strong>...
              </MarkerContent>
            </Marker>
          )}

          {getToolParts(message).map((tool: any, index: number) => (
            <Marker key={tool.toolCallId || `${tool.type}-${index}`}>
              <MarkerIcon>
                <WrenchIcon className="size-3" />
              </MarkerIcon>

              <MarkerContent>
                {tool.type.replace(/^tool-/, "")}

                {"state" in tool && <> ({tool.state})</>}
              </MarkerContent>
            </Marker>
          ))}

          {isUser ? (
            <Bubble>
              <BubbleContent>{text}</BubbleContent>
            </Bubble>
          ) : text ? (
            <MemoizedMarkdown
              key={`${message.id}-text`}
              id={message.id}
              content={text}
            />
          ) : null}
        </MessageContent>
      </Message>
    </MessageScrollerItem>
  );
}
