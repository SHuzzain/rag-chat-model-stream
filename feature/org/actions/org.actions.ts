"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { member, organization } from "@/db/schema";
import { orgCacheTags } from "@/feature/org/cache-tag";
import { auth } from "@/lib/auth";
import { requireOrgSession, requireSession } from "@/lib/session";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export async function createOrganizationAction(formData: FormData) {
  await requireSession();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Organization name is required");

  const slug = `${slugify(name) || "org"}-${Date.now().toString(36)}`;

  const org = await auth.api.createOrganization({
    body: { name, slug },
    headers: await headers(),
  });

  if (org?.id) {
    await auth.api.setActiveOrganization({
      body: { organizationId: org.id },
      headers: await headers(),
    });
  }

  updateTag(orgCacheTags.list);
  revalidatePath("/", "layout");
  redirect("/chatbots");
}

export async function setActiveOrganizationAction(organizationId: string) {
  const { user } = await requireSession();
  const [membership] = await db
    .select({ id: member.id })
    .from(member)
    .where(
      and(eq(member.organizationId, organizationId), eq(member.userId, user.id))
    )
    .limit(1);

  if (!membership) throw new Error("Not a member of this organization");

  await auth.api.setActiveOrganization({
    body: { organizationId },
    headers: await headers(),
  });

  updateTag(orgCacheTags.list);
  updateTag(orgCacheTags.get(organizationId));
  revalidatePath("/", "layout");
  redirect("/chatbots");
}

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
