"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ingestFileAction } from "@/feature/knowledge/actions/ingest.actions";
import type { KnowledgeFileType } from "@/feature/knowledge/types";

const FILE_TYPES: {
  value: KnowledgeFileType;
  label: string;
  accept: string;
  hint: string;
}[] = [
  { value: "json", label: "JSON", accept: ".json,application/json", hint: "Accepted: .json array of objects • Max size: 10 MB" },
  { value: "pdf", label: "PDF", accept: ".pdf,application/pdf", hint: "Accepted: .pdf • Max size: 10 MB" },
  { value: "csv", label: "CSV", accept: ".csv,text/csv", hint: "Accepted: .csv • Max size: 10 MB" },
  { value: "xlsx", label: "Excel", accept: ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", hint: "Accepted: .xlsx • Max size: 10 MB" },
  { value: "docx", label: "Word", accept: ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document", hint: "Accepted: .docx • Max size: 10 MB" },
];

export function UploadFileDialog({
  chatbotId,
  triggerLabel = "Upload file",
}: {
  chatbotId?: string;
  triggerLabel?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [fileType, setFileType] = useState<KnowledgeFileType>("json");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const selected = FILE_TYPES.find((item) => item.value === fileType)!;

  function reset() {
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onFileChange(next: File | null) {
    setError(null);
    if (next && next.size > 10 * 1024 * 1024) {
      setError("File must be 10 MB or smaller");
      setFile(null);
      return;
    }
    setFile(next);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger render={<Button />}>{triggerLabel}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload file</DialogTitle>
          <DialogDescription>
            Choose how you want to use this file
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!file) return;
            const formData = new FormData();
            formData.set("sourceType", fileType);
            formData.set("file", file);
            if (chatbotId) formData.set("chatbotId", chatbotId);

            startTransition(async () => {
              try {
                await ingestFileAction(formData);
                setOpen(false);
                reset();
                router.refresh();
              } catch (caught) {
                setError(
                  caught instanceof Error ? caught.message : "Upload failed"
                );
              }
            });
          }}
        >
          <div className="space-y-1.5">
            <Label>File type</Label>
            <Select
              value={fileType}
              onValueChange={(value) => {
                if (value) setFileType(value as KnowledgeFileType);
                onFileChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILE_TYPES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <label
            htmlFor="knowledge-file"
            className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-6 text-center"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              onFileChange(event.dataTransfer.files[0] ?? null);
            }}
          >
            <input
              ref={inputRef}
              id="knowledge-file"
              type="file"
              accept={selected.accept}
              className="sr-only"
              onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
            />
            <p className="text-sm">
              {file
                ? file.name
                : "Drag and drop a file here or click to select a file."}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{selected.hint}</p>
          </label>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="submit" disabled={!file || pending}>
              {pending ? "Uploading…" : "Upload file"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
