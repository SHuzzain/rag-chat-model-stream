"use client";

import { useQuery } from "@tanstack/react-query";

import { getUsageSummary } from "@/feature/usage/actions/usage.actions";
import { usageCacheTags } from "@/feature/usage/cache-tag";

export function useUsageSummary(
  chatbotId?: string,
  initialData?: Awaited<ReturnType<typeof getUsageSummary>>
) {
  return useQuery({
    queryKey: [usageCacheTags.list, chatbotId ?? "org"],
    queryFn: () => getUsageSummary(chatbotId),
    initialData,
  });
}
