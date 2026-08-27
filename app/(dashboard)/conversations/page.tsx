import { getUsageSummary } from "@/feature/usage/actions/usage.actions";

export default async function ConversationsPage() {
  const summary = await getUsageSummary();
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Conversations</h1>
      <p className="text-sm text-muted-foreground">
        {summary.conversations} conversations recorded for this organization.
      </p>
    </div>
  );
}
