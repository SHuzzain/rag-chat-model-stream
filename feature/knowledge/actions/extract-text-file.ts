"use server";

import path from "path";

import { chunkContent } from "@/feature/knowledge/actions/chunking";
import { extractTextFromDocx } from "@/feature/knowledge/actions/extract-docx";
import type { ChunkDraft } from "@/feature/knowledge/types";
import { createHash } from "@/lib/utils";

export async function loadDocTextFile() {
  const records: ChunkDraft[] = [];
  const docxFilePath = path.join(process.cwd(), "docs", "mindchamps.docx");
  const content = await extractTextFromDocx(docxFilePath);
  const pieces = await chunkContent(content.text);

  for (let i = 0; i < pieces.length; i++) {
    const text = pieces[i];
    if (!text) continue;
    records.push({
      content: text,
      sourceName: docxFilePath,
      chunkIndex: i,
      checksum: createHash(text),
    });
  }

  return records;
}
