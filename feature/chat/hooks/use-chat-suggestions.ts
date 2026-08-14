import { UIMessage } from "ai";

const DEFAULT_SUGGESTIONS = [
  "How can I pay my fees?",
  "What is ChampsLMS and how do I log in?",
  "What device or browser should I use?",
];

interface UseChatSuggestionsOptions {
  messages?: UIMessage[];
  isBusy?: boolean;
  defaultSuggestions?: string[];
}

export function useChatSuggestions({
  messages = [],
  isBusy = false,
  defaultSuggestions = DEFAULT_SUGGESTIONS,
}: UseChatSuggestionsOptions = {}) {
  const lastAssistantMessage = messages
    .filter((m) => m.role === "assistant")
    .at(-1);

  // 1. Check if suggestions loading marker is present in message parts
  const isSuggestionsLoading = Boolean(
    lastAssistantMessage?.parts?.some(
      (part) => part.type === "data-suggestions-loading"
    )
  );

  // 2. Extract generated suggestions data part
  const suggestionsPart = lastAssistantMessage?.parts?.find(
    (part) => part.type === "data-suggestions"
  ) as { type: string; data?: { suggestions?: string[] } } | undefined;

  const dataSuggestions = suggestionsPart?.data?.suggestions;

  // 3. Determine if main response text is still streaming
  const isMainTextStreaming = isBusy && !isSuggestionsLoading;

  // 4. Determine current suggestions array
  const suggestions =
    dataSuggestions && dataSuggestions.length > 0
      ? dataSuggestions
      : messages.length === 0
        ? defaultSuggestions
        : [];

  // 5. Determine if loading skeleton should be displayed
  const isLoading =
    isSuggestionsLoading && (!dataSuggestions || dataSuggestions.length === 0);

  // 6. Component should be visible unless main text is streaming or no suggestions available
  const isVisible =
    !isMainTextStreaming && (isLoading || suggestions.length > 0);

  return {
    suggestions,
    isLoading,
    isVisible,
    isMainTextStreaming,
  };
}
