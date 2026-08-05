"use client"

import * as React from "react"
import { SparklesIcon, UserIcon } from "lucide-react"

import { getMessageText } from "@/lib/ai"
import { MessageScrollerItem } from "@/components/ui/message-scroller"
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UIMessage } from "ai"

export interface MessageAnimatedProps extends React.ComponentProps<typeof MessageScrollerItem> {
  message: UIMessage
  scrollAnchor?: boolean
}

export function MessageAnimated({
  message,
  scrollAnchor = false,
  className,
  ...props
}: MessageAnimatedProps) {
  const isUser = message.role === "user"
  const text = getMessageText(message)

  return (
    <MessageScrollerItem scrollAnchor={scrollAnchor} className={className} {...props}>
      <Message align={isUser ? "end" : "start"}>
        <MessageAvatar>
          <Avatar className="size-8">
            <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-muted"}>
              {isUser ? <UserIcon className="size-4" /> : <SparklesIcon className="size-4" />}
            </AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble variant={isUser ? "default" : "secondary"}>
            <BubbleContent>{text}</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageScrollerItem>
  )
}
