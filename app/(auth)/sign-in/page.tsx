import { SignInCard } from "@/feature/auth/components/sign-in-card";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await getSession();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <SignInCard />
    </div>
  );
}
