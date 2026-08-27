"use client";

import { useQuery } from "@tanstack/react-query";

import {
  listAttachedDocuments,
  listOrganizationDocuments,
  listUnattachedKnowledge,
} from "@/feature/knowledge/actions/knowledge.actions";
import { knowledgeCacheTags } from "@/feature/knowledge/cache-tag";

export function useOrganizationDocuments(
  initialData?: Awaited<ReturnType<typeof listOrganizationDocuments>>
) {
  return useQuery({
    queryKey: [knowledgeCacheTags.list],
    queryFn: () => listOrganizationDocuments(),
    initialData,
  });
}

export function useAttachedDocuments(
  chatbotId: string,
  initialData?: Awaited<ReturnType<typeof listAttachedDocuments>>
) {
  return useQuery({
    queryKey: [knowledgeCacheTags.list, knowledgeCacheTags.attached(chatbotId)],
    queryFn: () => listAttachedDocuments(chatbotId),
    enabled: Boolean(chatbotId),
    initialData,
  });
}

export function useUnattachedKnowledge(
  chatbotId: string,
  initialData?: Awaited<ReturnType<typeof listUnattachedKnowledge>>
) {
  return useQuery({
    queryKey: [
      knowledgeCacheTags.list,
      knowledgeCacheTags.attached(chatbotId),
      "unattached",
    ],
    queryFn: () => listUnattachedKnowledge(chatbotId),
    enabled: Boolean(chatbotId),
    initialData,
  });
}
