"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function SignInCard() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup" | "magic">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (mode === "magic") {
        const result = await authClient.signIn.magicLink({
          email,
          callbackURL: "/dashboard",
        });
        if (result.error) throw new Error(result.error.message);
        setMagicSent(true);
        return;
      }
      if (mode === "signup") {
        const result = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0],
        });
        if (result.error) throw new Error(result.error.message);
      } else {
        const result = await authClient.signIn.email({ email, password });
        if (result.error) throw new Error(result.error.message);
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>
          {mode === "signup" ? "Create an account" : "Sign in"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-3" onSubmit={onSubmit}>
          {mode === "signup" ? (
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          {mode !== "magic" ? (
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {magicSent ? (
            <p className="text-sm text-muted-foreground">
              Check your email for a sign-in link.
            </p>
          ) : (
            <Button type="submit" disabled={pending}>
              {pending
                ? "Please wait"
                : mode === "magic"
                  ? "Send magic link"
                  : mode === "signup"
                    ? "Sign up"
                    : "Sign in"}
            </Button>
          )}
        </form>
        <div className="mt-4 flex flex-col gap-1 text-sm text-muted-foreground">
          <button
            type="button"
            className="text-left hover:text-foreground"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          >
            {mode === "signup"
              ? "Already have an account? Sign in"
              : "Need an account? Sign up"}
          </button>
          <button
            type="button"
            className="text-left hover:text-foreground"
            onClick={() => setMode(mode === "magic" ? "signin" : "magic")}
          >
            {mode === "magic" ? "Use password instead" : "Use a magic link"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
