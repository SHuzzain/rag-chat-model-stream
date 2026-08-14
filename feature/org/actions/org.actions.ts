"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { member } from "@/db/schema";
import { auth } from "@/lib/auth";
import { requireSession } from "@/lib/session";

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

  revalidatePath("/", "layout");
  redirect("/chatbots");
}
