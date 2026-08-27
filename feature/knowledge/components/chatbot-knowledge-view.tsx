"use client";

import { useState } from "react";

import { attachKnowledgeAction } from "@/feature/knowledge/actions/ingest.actions";
import { attachedColumns } from "@/feature/knowledge/components/knowledge-columns";
import { UploadFileDialog } from "@/feature/knowledge/components/upload-file-dialog";
import {
  useAttachedDocuments,
  useUnattachedKnowledge,
} from "@/feature/knowledge/queries/knowledge.queries";
import type { AttachableKnowledge, LibraryDocument } from "@/feature/knowledge/types";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ChatbotKnowledgeView({
  chatbotId,
  documents: initialDocuments,
  available: initialAvailable,
  canEdit,
}: {
  chatbotId: string;
  documents: LibraryDocument[];
  available: AttachableKnowledge[];
  canEdit: boolean;
}) {
  const { data: attached } = useAttachedDocuments(chatbotId);
  const { data: unattached } = useUnattachedKnowledge(chatbotId);
  const documents = attached ?? initialDocuments;
  const available = unattached ?? initialAvailable;
  const [selectedId, setSelectedId] = useState(available[0]?.knowledgeBaseId ?? "");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Select existing library files or upload new ones. Retrieval only uses
          attached knowledge.
        </p>
        {canEdit ? (
          <UploadFileDialog chatbotId={chatbotId} triggerLabel="Upload file" />
        ) : null}
      </div>

      {canEdit && available.length > 0 ? (
        <form action={attachKnowledgeAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="chatbotId" value={chatbotId} />
          <input type="hidden" name="knowledgeBaseId" value={selectedId} />
          <div className="min-w-64 flex-1 space-y-1.5">
            <Label>Select knowledge</Label>
            <Select
              value={selectedId}
              onValueChange={(value) => {
                if (value) setSelectedId(value);
              }}
            >
              <SelectTrigger id="knowledgeBaseId" className="w-full">
                <SelectValue placeholder="Choose a library file" />
              </SelectTrigger>
              <SelectContent>
                {available.map((item) => (
                  <SelectItem key={item.knowledgeBaseId} value={item.knowledgeBaseId}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">Attach</Button>
        </form>
      ) : null}

      <DataTable
        columns={attachedColumns(chatbotId, canEdit)}
        data={documents}
        emptyState={
          <p className="py-10 text-center text-sm text-muted-foreground">
            No knowledge attached yet. Select a library file or upload one.
          </p>
        }
      />
    </div>
  );
}
