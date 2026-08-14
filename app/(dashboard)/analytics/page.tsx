import { AnalyticsView } from "@/feature/usage/components/analytics-view";
import { getUsageSummary } from "@/feature/usage/queries/usage.queries";

export default async function AnalyticsPage() {
  const summary = await getUsageSummary();
  return <AnalyticsView summary={summary} />;
}
