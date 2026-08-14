import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { member, organization } from "@/db/schema";
import { auth } from "@/lib/auth";
import { requireOrgSession, requireSession } from "@/lib/session";
import { headers } from "next/headers";

export async function getActiveOrganization() {
  const { organizationId } = await requireOrgSession();
  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, organizationId))
    .limit(1);
  return org ?? null;
}

export async function getMembershipRole() {
  const { user, organizationId } = await requireOrgSession();
  const [row] = await db
    .select({ role: member.role })
    .from(member)
    .where(
      and(eq(member.userId, user.id), eq(member.organizationId, organizationId))
    )
    .limit(1);
  return row?.role ?? "member";
}

export async function listUserOrganizations() {
  await requireSession();
  return auth.api.listOrganizations({
    headers: await headers(),
  });
}
