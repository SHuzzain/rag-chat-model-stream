"use server";

import fs from "fs";
import path from "path";

import type { ChunkDraft } from "@/feature/knowledge/types";
import { createHash } from "@/lib/utils";

export async function loadJsonFile() {
  const records: ChunkDraft[] = [];
  const fileName = "mindchamps-faq";
  const jsonFilePath = path.join(process.cwd(), "docs", `${fileName}.json`);
  const content = await fs.promises.readFile(jsonFilePath, "utf-8");
  const data = JSON.parse(content) as {
    question: string;
    answer: string;
    topic: string;
  }[];

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (!item) continue;
    const text = `${item.topic}  ${item.question} ${item.answer}`;
    records.push({
      content: text,
      sourceName: fileName,
      chunkIndex: i,
      checksum: createHash(text),
      metaData: item,
    });
  }

  return records;
}
