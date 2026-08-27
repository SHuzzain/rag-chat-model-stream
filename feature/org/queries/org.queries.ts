"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getActiveOrganization,
  getMembershipRole,
  listUserOrganizations,
} from "@/feature/org/actions/org.actions";
import { orgCacheTags } from "@/feature/org/cache-tag";

export function useActiveOrganization(
  initialData?: Awaited<ReturnType<typeof getActiveOrganization>>
) {
  return useQuery({
    queryKey: [orgCacheTags.list, "active"],
    queryFn: () => getActiveOrganization(),
    initialData,
  });
}

export function useMembershipRole(
  initialData?: Awaited<ReturnType<typeof getMembershipRole>>
) {
  return useQuery({
    queryKey: [orgCacheTags.list, "role"],
    queryFn: () => getMembershipRole(),
    initialData,
  });
}

export function useUserOrganizations(
  initialData?: Awaited<ReturnType<typeof listUserOrganizations>>
) {
  return useQuery({
    queryKey: [orgCacheTags.list],
    queryFn: () => listUserOrganizations(),
    initialData,
  });
}
