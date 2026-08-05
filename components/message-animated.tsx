"use client";

import * as React from "react";
import { SparklesIcon, UserIcon, WrenchIcon } from "lucide-react";

import { getMessageText } from "@/lib/ai";
import { MessageScrollerItem } from "@/components/ui/message-scroller";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Marker,
  MarkerIcon,
  MarkerContent,
} from "@/components/ui/marker";
import { Spinner } from "@/components/ui/spinner";
import { UIMessage } from "ai";
import { MemoizedMarkdown } from "./memoized-markdown";

export interface MessageAnimatedProps
  extends React.ComponentProps<typeof MessageScrollerItem> {
  message: UIMessage;
  scrollAnchor?: boolean;
}

function getToolParts(message: UIMessage) {
  return message.parts.filter(
    (part) =>
      typeof part.type === "string" &&
      part.type.startsWith("tool-")
  );
}

function getRunningTool(message: UIMessage) {
  return getToolParts(message).find((part) => {
    if (!("state" in part)) return false;

    return (
      part.state === "input-streaming" ||
      part.state === "input-available"
    );
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
        <MessageAvatar>
          <Avatar className="size-8">
            <AvatarFallback
              className={
                isUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }
            >
              {isUser ? (
                <UserIcon className="size-4" />
              ) : (
                <SparklesIcon className="size-4" />
              )}
            </AvatarFallback>
          </Avatar>
        </MessageAvatar>

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

          {getToolParts(message).map((tool: any) => (
            <Marker key={tool.type}>
              <MarkerIcon>
                <WrenchIcon className="size-3" />
              </MarkerIcon>

              <MarkerContent>
                {tool.type.replace(/^tool-/, "")}

                {"state" in tool && (
                  <> ({tool.state})</>
                )}
              </MarkerContent>
            </Marker>
          ))}

          {isUser ? (
            <Bubble>
              <BubbleContent>{text}</BubbleContent>
            </Bubble>
          ) : text ?
            <MemoizedMarkdown
              key={`${message.id}-text`}
              id={message.id}
              content={text}
            />
            : null}
        </MessageContent>
      </Message>
    </MessageScrollerItem>
  );
}