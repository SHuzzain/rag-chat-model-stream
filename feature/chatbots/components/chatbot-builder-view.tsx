"use client";

import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { updateChatbotAction } from "@/feature/chatbots/actions/chatbots.actions";
import {
  publishChatbotAction,
  rollbackChatbotAction,
  updateDeploymentAction,
} from "@/feature/chatbots/actions/publish.actions";
import { ChatbotKnowledgeView } from "@/feature/knowledge/components/chatbot-knowledge-view";
import type { AttachableKnowledge, LibraryDocument } from "@/feature/knowledge/types";

type Bot = {
  id: string;
  name: string;
  description: string | null;
  systemPrompt: string;
  modelProvider: string;
  modelName: string;
  temperature: number;
  maxOutputTokens: number;
  welcomeMessage: string | null;
  suggestedQuestions: string[];
  isPublished: boolean;
  publishedVersion: number | null;
};

type Deployment = {
  publicBotId: string;
  allowedDomains: string[];
  rateLimitPerMinute: number;
} | null;

type Version = {
  id: string;
  version: number;
  publishedAt: Date;
  checksum: string;
};

export function ChatbotBuilderView({
  bot,
  deployment,
  versions,
  documents,
  availableKnowledge,
  canPublish,
  canEdit,
}: {
  bot: Bot;
  deployment: Deployment;
  versions: Version[];
  documents: LibraryDocument[];
  availableKnowledge: AttachableKnowledge[];
  canPublish: boolean;
  canEdit: boolean;
}) {
  const router = useRouter();
  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";

  const hostedUrl = deployment
    ? `${appUrl}/b/${deployment.publicBotId}`
    : null;
  const embedUrl = deployment
    ? `${appUrl}/embed/${deployment.publicBotId}`
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{bot.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure instructions, model, knowledge, and deployment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={bot.isPublished ? "secondary" : "outline"}>
            {bot.isPublished ? `v${bot.publishedVersion}` : "Draft"}
          </Badge>
          {canPublish ? (
            <Button
              type="button"
              onClick={async () => {
                await publishChatbotAction(bot.id);
                router.refresh();
              }}
            >
              Publish
            </Button>
          ) : null}
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList variant="line">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
          <TabsTrigger value="model">Model</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
        </TabsList>

        <form action={updateChatbotAction} className="mt-6 space-y-4">
          <input type="hidden" name="id" value={bot.id} />
          <TabsContent value="general" className="space-y-4">
            <Field label="Name" htmlFor="name">
              <Input id="name" name="name" defaultValue={bot.name} required />
            </Field>
            <Field label="Description" htmlFor="description">
              <Textarea
                id="description"
                name="description"
                defaultValue={bot.description ?? ""}
              />
            </Field>
            <Field label="Welcome message" htmlFor="welcomeMessage">
              <Input
                id="welcomeMessage"
                name="welcomeMessage"
                defaultValue={bot.welcomeMessage ?? ""}
              />
            </Field>
            <Field
              label="Suggested questions (one per line)"
              htmlFor="suggestedQuestions"
            >
              <Textarea
                id="suggestedQuestions"
                name="suggestedQuestions"
                defaultValue={bot.suggestedQuestions.join("\n")}
              />
            </Field>
            <Button type="submit">Save</Button>
          </TabsContent>

          <TabsContent value="instructions" className="space-y-4">
            <Field label="System prompt" htmlFor="systemPrompt">
              <Textarea
                id="systemPrompt"
                name="systemPrompt"
                className="min-h-64"
                defaultValue={bot.systemPrompt}
              />
            </Field>
            <input type="hidden" name="name" value={bot.name} />
            <Button type="submit">Save</Button>
          </TabsContent>

          <TabsContent value="model" className="space-y-4">
            <Field label="Provider" htmlFor="modelProvider">
              <Input
                id="modelProvider"
                name="modelProvider"
                defaultValue={bot.modelProvider}
              />
            </Field>
            <Field label="Model" htmlFor="modelName">
              <Input
                id="modelName"
                name="modelName"
                defaultValue={bot.modelName}
              />
            </Field>
            <Field label="Temperature" htmlFor="temperature">
              <Input
                id="temperature"
                name="temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
                defaultValue={bot.temperature}
              />
            </Field>
            <Field label="Max output tokens" htmlFor="maxOutputTokens">
              <Input
                id="maxOutputTokens"
                name="maxOutputTokens"
                type="number"
                min="16"
                defaultValue={bot.maxOutputTokens}
              />
            </Field>
            <input type="hidden" name="name" value={bot.name} />
            <input type="hidden" name="systemPrompt" value={bot.systemPrompt} />
            <Button type="submit">Save</Button>
          </TabsContent>
        </form>

        <TabsContent value="knowledge" className="mt-6">
          <ChatbotKnowledgeView
            chatbotId={bot.id}
            documents={documents}
            available={availableKnowledge}
            canEdit={canEdit}
          />
        </TabsContent>

        <TabsContent value="deployment" className="mt-6 space-y-4">
          {deployment && hostedUrl && embedUrl ? (
            <>
              <p className="text-sm">
                Hosted URL:{" "}
                <a className="underline" href={hostedUrl}>
                  {hostedUrl}
                </a>
              </p>
              <Field label="Embed snippet">
                <Textarea
                  readOnly
                  value={`<iframe src="${embedUrl}" style="width:400px;height:640px;border:0;"></iframe>`}
                />
              </Field>
              <p className="text-xs text-muted-foreground">
                Empty allowed domains permits all origins for local testing.
                Set production domains before going live.
              </p>
              <form action={updateDeploymentAction} className="space-y-4">
                <input type="hidden" name="chatbotId" value={bot.id} />
                <Field label="Allowed domains (one per line)">
                  <Textarea
                    name="allowedDomains"
                    defaultValue={deployment.allowedDomains.join("\n")}
                  />
                </Field>
                <Field label="Rate limit per minute">
                  <Input
                    name="rateLimitPerMinute"
                    type="number"
                    defaultValue={deployment.rateLimitPerMinute}
                  />
                </Field>
                <Button type="submit">Save deployment</Button>
              </form>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Publish the chatbot to generate a public URL and embed snippet.
            </p>
          )}
        </TabsContent>

        <TabsContent value="versions" className="mt-6 space-y-2">
          {versions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No published versions yet.</p>
          ) : (
            versions.map((version) => (
              <div
                key={version.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">Version {version.version}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(version.publishedAt).toLocaleString()} · {version.checksum.slice(0, 10)}
                  </p>
                </div>
                {canPublish ? (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={async () => {
                      await rollbackChatbotAction(bot.id, version.version);
                      router.refresh();
                    }}
                  >
                    Rollback
                  </Button>
                ) : null}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
