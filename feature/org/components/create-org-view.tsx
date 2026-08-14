import { createOrganizationAction } from "@/feature/org/actions/org.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateOrgView() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an organization
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Chatbots, knowledge, and usage are scoped to an organization.
        </p>
      </div>
      <form action={createOrganizationAction} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="name">Organization name</Label>
          <Input id="name" name="name" required placeholder="Acme" />
        </div>
        <Button type="submit">Continue</Button>
      </form>
    </div>
  );
}
