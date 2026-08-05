"use client";

import type { ChatStatus } from "ai";
import { CardFooter } from "@/components/ui/card";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";

interface ChatInputProps {
  status: ChatStatus;
  isBusy: boolean;
  onSendMessage: (text: string) => void;
  onStop?: () => void;
}

export function ChatInput({ status, isBusy, onSendMessage, onStop }: ChatInputProps) {
  return (
    <CardFooter>
      <PromptInput
        onSubmit={({ text }) => {
          if (text.trim()) {
            onSendMessage(text);
          }
        }}
      >
        <PromptInputTextarea
          placeholder={
            isBusy ? "Generating..." : "Ask a question..."
          }
          disabled={isBusy}
        />
        <PromptInputFooter>
          <PromptInputSubmit
            status={status}
            onStop={onStop}
          />
        </PromptInputFooter>
      </PromptInput>
    </CardFooter>
  );
}
