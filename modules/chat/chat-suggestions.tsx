"use client";

import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Kbd } from "@/components/ui/kbd";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatSuggestions } from "@/hooks/useChatSuggestions";
import { UIMessage } from "ai";
import { useEffect, useEffectEvent, useRef, useState } from "react";

interface ChatSuggestionsProps {
    messages?: UIMessage[];
    isBusy?: boolean;
    onSendMessage: (text: string) => void;
}

const ChatSuggestions = ({
    messages = [],
    isBusy = false,
    onSendMessage,
}: ChatSuggestionsProps) => {
    const suggestionRef = useRef<HTMLDivElement>(null);
    const [showHint, setShowHint] = useState(false);

    const { suggestions, isLoading, isVisible } = useChatSuggestions({
        messages,
        isBusy,
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
                <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
                    <Skeleton className="h-8 rounded-full flex-[0.5]" />
                    <Skeleton className="h-8 rounded-full flex-[0.8]" />
                    <Skeleton className="h-8 rounded-full flex-[0.5]" />
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
        <div className="px-4 py-2 relative ">
            {showHint &&
                <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-md bg-black px-3 py-2 text-xs text-white shadow-lg whitespace-nowrap">
                    Hold <Kbd>Shift</Kbd> and scroll to move suggestions
                </div>
            }
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
};

export default ChatSuggestions;