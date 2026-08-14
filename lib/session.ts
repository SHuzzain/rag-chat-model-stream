import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/sign-in");
  }
  return session;
}

export async function requireOrgSession() {
  const session = await requireSession();
  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) {
    redirect("/onboarding");
  }
  return {
    user: session.user,
    session: session.session,
    organizationId,
  };
}
