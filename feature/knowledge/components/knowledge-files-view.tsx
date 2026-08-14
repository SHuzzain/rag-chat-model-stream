"use client";

import { FileStackIcon } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { libraryColumns } from "@/feature/knowledge/components/knowledge-columns";
import { UploadFileDialog } from "@/feature/knowledge/components/upload-file-dialog";
import type { LibraryDocument } from "@/feature/knowledge/types";

export function KnowledgeFilesView({
  documents,
  canEdit,
}: {
  documents: LibraryDocument[];
  canEdit: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Files</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload and manage knowledge files. Attach them to a chatbot from its
            Knowledge tab.
          </p>
        </div>
        {canEdit ? <UploadFileDialog triggerLabel="Upload file" /> : null}
      </div>

      <DataTable
        columns={libraryColumns(canEdit)}
        data={documents}
        emptyState={
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border py-16 text-center">
            <FileStackIcon className="size-8 text-muted-foreground" />
            <p className="text-lg font-medium">No files for now</p>
            <p className="text-sm text-muted-foreground">
              You do not have any files for now.
            </p>
            {canEdit ? <UploadFileDialog triggerLabel="Upload file" /> : null}
          </div>
        }
      />
    </div>
  );
}
