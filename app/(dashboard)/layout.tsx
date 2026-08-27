import { AppShell } from "@/components/app-shell";
import {
  getActiveOrganization,
  listUserOrganizations,
} from "@/feature/org/actions/org.actions";
import { requireOrgSession } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, organizationId } = await requireOrgSession();
  const org = await getActiveOrganization();
  const orgs = await listUserOrganizations();
  const listed = Array.isArray(orgs) ? orgs : [];

  const teams = listed.length
    ? listed.map((item) => ({
        id: item.id,
        name: item.name,
        plan: item.slug || "Workspace",
      }))
    : [
        {
          id: organizationId,
          name: org?.name ?? "Organization",
          plan: org?.slug ?? "Workspace",
        },
      ];

  return (
    <AppShell
      user={{
        name: user.name,
        email: user.email,
        avatar: user.image ?? "",
      }}
      teams={teams}
      activeTeamId={organizationId}
    >
      {children}
    </AppShell>
  );
}
