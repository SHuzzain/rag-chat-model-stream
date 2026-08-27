"use client";

import { useUsageSummary } from "@/feature/usage/queries/usage.queries";

type UsageSummary = {
  conversations: number;
  events: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  providerCost: number;
  customerCost: number;
  avgLatency: number;
};

export function AnalyticsView({ summary: initialSummary }: { summary: UsageSummary }) {
  const { data: summary = initialSummary } = useUsageSummary(
    undefined,
    initialSummary
  );
  const stats = [
    { label: "Conversations", value: summary.conversations.toLocaleString() },
    { label: "Model requests", value: summary.events.toLocaleString() },
    { label: "Input tokens", value: summary.inputTokens.toLocaleString() },
    { label: "Output tokens", value: summary.outputTokens.toLocaleString() },
    { label: "Total tokens", value: summary.totalTokens.toLocaleString() },
    { label: "Provider cost", value: `$${summary.providerCost.toFixed(4)}` },
    { label: "Customer charge", value: `$${summary.customerCost.toFixed(4)}` },
    { label: "Avg latency", value: `${Math.round(summary.avgLatency)} ms` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Token usage and conversation volume for this organization.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border px-4 py-3">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-lg font-medium">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
