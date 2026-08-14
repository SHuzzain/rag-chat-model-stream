"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BotIcon, ChevronDownIcon, PlusIcon, SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { createChatbotAction } from "@/feature/chatbots/actions/chatbots.actions";

type ChatbotRow = {
  id: string;
  name: string;
  description: string | null;
  isPublished: boolean;
  updatedAt: Date;
};

export function ChatbotsListView({ chatbots }: { chatbots: ChatbotRow[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"name" | "updated">("updated");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const rows = chatbots.filter(
      (bot) =>
        bot.name.toLowerCase().includes(q) ||
        (bot.description ?? "").toLowerCase().includes(q)
    );
    return rows.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      return +new Date(b.updatedAt) - +new Date(a.updatedAt);
    });
  }, [chatbots, query, sort]);

  const published = filtered.filter((bot) => bot.isPublished);
  const drafts = filtered.filter((bot) => !bot.isPublished);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chatbots</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage your chatbots.
          </p>
        </div>
        <form action={createChatbotAction} className="flex items-center gap-2">
          <Input name="name" placeholder="New chatbot name" required />
          <Button type="submit">
            <PlusIcon />
            Create chatbot
          </Button>
        </form>
      </div>

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="bg-muted/40 pl-8"
          placeholder="Search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-[1fr_120px_140px] gap-3 border-b px-2 pb-2 text-xs font-medium text-muted-foreground">
        <button className="text-left" type="button" onClick={() => setSort("name")}>
          Name
        </button>
        <span>Status</span>
        <button className="text-left" type="button" onClick={() => setSort("updated")}>
          Updated
        </button>
      </div>

      {filtered.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BotIcon />
            </EmptyMedia>
            <EmptyTitle>No chatbots yet</EmptyTitle>
            <EmptyDescription>
              Create a chatbot to configure prompts, models, and publishing.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-4">
          <BotGroup title={`Published (${published.length})`} rows={published} />
          <BotGroup title={`Draft (${drafts.length})`} rows={drafts} />
        </div>
      )}
    </div>
  );
}

function BotGroup({ title, rows }: { title: string; rows: ChatbotRow[] }) {
  if (rows.length === 0) return null;
  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="flex items-center gap-1 px-2 text-sm font-medium">
        <ChevronDownIcon className="size-4" />
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1">
        {rows.map((bot) => (
          <Link
            key={bot.id}
            href={`/chatbots/${bot.id}`}
            className="grid grid-cols-[1fr_120px_140px] items-center gap-3 rounded-lg px-2 py-3 hover:bg-muted/60"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-md bg-muted">
                <BotIcon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium">{bot.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {bot.description || "No description"}
                </p>
              </div>
            </div>
            <Badge variant={bot.isPublished ? "secondary" : "outline"}>
              {bot.isPublished ? "Published" : "Draft"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {new Date(bot.updatedAt).toLocaleDateString()}
            </span>
          </Link>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
