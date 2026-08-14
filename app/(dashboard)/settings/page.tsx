import { getActiveOrganization } from "@/feature/org/queries/org.queries";

export default async function SettingsPage() {
  const org = await getActiveOrganization();
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Organization</h1>
      <p className="text-sm text-muted-foreground">
        {org?.name} · {org?.slug}
      </p>
    </div>
  );
}
