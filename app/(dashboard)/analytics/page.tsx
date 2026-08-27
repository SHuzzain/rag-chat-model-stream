import { AnalyticsView } from "@/feature/usage/components/analytics-view";
import { getUsageSummary } from "@/feature/usage/actions/usage.actions";

export default async function AnalyticsPage() {
  const summary = await getUsageSummary();
  return <AnalyticsView summary={summary} />;
}
