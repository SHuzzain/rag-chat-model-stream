import { CreateOrgView } from "@/feature/org/components/create-org-view";
import { requireSession } from "@/lib/session";

export default async function OnboardingPage() {
  await requireSession();
  return (
    <div className="min-h-svh bg-background p-6">
      <CreateOrgView />
    </div>
  );
}
