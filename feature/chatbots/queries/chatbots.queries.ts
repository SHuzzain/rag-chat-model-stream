"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getChatbot,
  getChatbotWithDeployment,
  listChatbots,
} from "@/feature/chatbots/actions/chatbots.actions";
import { chatbotCacheTags } from "@/feature/chatbots/cache-tag";

export function useChatbots(
  initialData?: Awaited<ReturnType<typeof listChatbots>>
) {
  return useQuery({
    queryKey: [chatbotCacheTags.list],
    queryFn: () => listChatbots(),
    initialData,
  });
}

export function useChatbot(
  id: string,
  initialData?: Awaited<ReturnType<typeof getChatbot>>
) {
  return useQuery({
    queryKey: [chatbotCacheTags.list, chatbotCacheTags.get(id)],
    queryFn: () => getChatbot(id),
    enabled: Boolean(id),
    initialData,
  });
}

export function useChatbotWithDeployment(
  id: string,
  initialData?: Awaited<ReturnType<typeof getChatbotWithDeployment>>
) {
  return useQuery({
    queryKey: [chatbotCacheTags.list, chatbotCacheTags.get(id), "deployment"],
    queryFn: () => getChatbotWithDeployment(id),
    enabled: Boolean(id),
    initialData,
  });
}
