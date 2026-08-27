"use client";

import { useQuery } from "@tanstack/react-query";

import { getConversation } from "@/feature/chat/actions/persist.actions";
import { conversationCacheTags } from "@/feature/chat/cache-tag";

export function useConversation(id: string) {
  return useQuery({
    queryKey: [conversationCacheTags.list, conversationCacheTags.get(id)],
    queryFn: () => getConversation(id),
    enabled: Boolean(id),
  });
}
