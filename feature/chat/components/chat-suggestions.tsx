"use client";

import { useEffect, useRef, useState } from "react";

import { UIMessage } from "ai";

import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Kbd } from "@/components/ui/kbd";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatSuggestions } from "@/feature/chat/hooks/use-chat-suggestions";

interface ChatSuggestionsProps {
  messages?: UIMessage[];
  isBusy?: boolean;
  onSendMessage: (text: string) => void;
  defaultSuggestions?: string[];
}

export function ChatSuggestions({
  messages = [],
  isBusy = false,
  onSendMessage,
  defaultSuggestions,
}: ChatSuggestionsProps) {
  const suggestionRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(false);

  const { suggestions, isLoading, isVisible } = useChatSuggestions({
    messages,
    isBusy,
    defaultSuggestions,
  });

  useEffect(() => {
    const el = suggestionRef.current;
    if (!el) return;

    let isPointerDown = false;
    let startX = 0;

    const handlePointerDown = (e: PointerEvent) => {
      isPointerDown = true;
      startX = e.clientX;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isPointerDown) return;

      const deltaX = Math.abs(e.clientX - startX);

      // User is trying to drag horizontally
      if (deltaX > 12) {
        setShowHint(true);
      }
    };

    const handlePointerUp = () => {
      isPointerDown = false;

      // Hide tooltip after a short delay
      setTimeout(() => setShowHint(false), 1500);
    };

    el.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      el.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="px-4 py-2">
        <div className="flex scrollbar-none items-center gap-2 overflow-x-auto whitespace-nowrap">
          <Skeleton className="h-8 flex-[0.5] rounded-full" />
          <Skeleton className="h-8 flex-[0.8] rounded-full" />
          <Skeleton className="h-8 flex-[0.5] rounded-full" />
        </div>
      </div>
    );
  }

  const handleSubmit = (message: string) => {
    if (message.trim()) {
      onSendMessage(message);
    }
  };

  return (
    <div className="relative px-4 py-2">
      {showHint && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-md bg-black px-3 py-2 text-xs whitespace-nowrap text-white shadow-lg">
          Hold <Kbd>Shift</Kbd> and scroll to move suggestions
        </div>
      )}
      <Suggestions ref={suggestionRef}>
        {suggestions.map((suggestion) => (
          <Suggestion
            key={suggestion}
            onClick={handleSubmit}
            suggestion={suggestion}
          />
        ))}
      </Suggestions>
    </div>
  );
}
