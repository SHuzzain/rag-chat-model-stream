"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  deleteDocumentAction,
  detachKnowledgeAction,
} from "@/feature/knowledge/actions/ingest.actions";
import type { LibraryDocument } from "@/feature/knowledge/types";

function formatDate(value: Date) {
  return new Date(value).toLocaleString();
}

export function libraryColumns(canEdit: boolean): ColumnDef<LibraryDocument>[] {
  const columns: ColumnDef<LibraryDocument>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="max-w-64 truncate font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "sourceType",
      header: "Type",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
  ];

  if (canEdit) {
    columns.push({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <form action={deleteDocumentAction}>
          <input type="hidden" name="documentId" value={row.original.id} />
          <Button variant="outline" size="sm" type="submit">
            Delete
          </Button>
        </form>
      ),
    });
  }

  return columns;
}

export function attachedColumns(
  chatbotId: string,
  canEdit: boolean
): ColumnDef<LibraryDocument>[] {
  const columns = libraryColumns(false);

  if (canEdit) {
    columns.push({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <form action={detachKnowledgeAction}>
          <input type="hidden" name="chatbotId" value={chatbotId} />
          <input
            type="hidden"
            name="knowledgeBaseId"
            value={row.original.knowledgeBaseId}
          />
          <Button variant="outline" size="sm" type="submit">
            Detach
          </Button>
        </form>
      ),
    });
  }

  return columns;
}
