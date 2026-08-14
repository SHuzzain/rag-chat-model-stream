import { parse } from "csv-parse/sync";
import ExcelJS from "exceljs";
import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";

import { chunkContent } from "@/feature/knowledge/actions/chunking";
import type { ChunkDraft, KnowledgeFileType } from "@/feature/knowledge/types";
import { createHash } from "@/lib/utils";

function objectToText(record: Record<string, unknown>) {
  return Object.entries(record)
    .filter(([, value]) => value != null && String(value).trim() !== "")
    .map(([key, value]) =>
      `${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`
    )
    .join("\n");
}

function recordsToDrafts(
  records: Record<string, unknown>[],
  sourceName: string
): ChunkDraft[] {
  return records.map((record, chunkIndex) => {
    const content = objectToText(record);
    return {
      content,
      checksum: createHash(content),
      chunkIndex,
      sourceName,
      metaData: record,
    };
  });
}

function asObjectRecords(value: unknown, sourceName: string): ChunkDraft[] {
  if (!Array.isArray(value)) {
    throw new Error("JSON must be an array of objects");
  }
  const records: Record<string, unknown>[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error("JSON must be an array of objects");
    }
    records.push(item as Record<string, unknown>);
  }
  if (records.length === 0) throw new Error("File has no rows to ingest");
  return recordsToDrafts(records, sourceName);
}

async function extractJson(buffer: Buffer, sourceName: string) {
  const parsed = JSON.parse(buffer.toString("utf-8")) as unknown;
  return asObjectRecords(parsed, sourceName);
}

async function extractCsv(buffer: Buffer, sourceName: string) {
  const records = parse(buffer.toString("utf-8"), {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  }) as Record<string, unknown>[];
  if (records.length === 0) throw new Error("CSV has no data rows");
  return recordsToDrafts(records, sourceName);
}

async function extractExcel(buffer: Buffer, sourceName: string) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error("Excel file has no worksheets");

  const headerRow = sheet.getRow(1);
  const headers = new Map<number, string>();
  headerRow.eachCell((cell, colNumber) => {
    headers.set(
      colNumber,
      String(cell.value ?? "").trim() || `column_${colNumber}`
    );
  });

  const records: Record<string, unknown>[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const record: Record<string, unknown> = {};
    headers.forEach((header, colNumber) => {
      const value = row.getCell(colNumber).value;
      record[header] =
        value && typeof value === "object" && "text" in value
          ? String((value as { text: string }).text)
          : value;
    });
    if (Object.values(record).some((value) => value != null && String(value) !== "")) {
      records.push(record);
    }
  });

  if (records.length === 0) throw new Error("Excel sheet has no data rows");
  return recordsToDrafts(records, sourceName);
}

async function extractPdf(buffer: Buffer, sourceName: string) {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  const body = Array.isArray(text) ? text.join("\n") : text;
  if (!body.trim()) throw new Error("PDF has no extractable text");
  const pieces = await chunkContent(body);
  return pieces.map((content, chunkIndex) => ({
    content,
    checksum: createHash(content),
    chunkIndex,
    sourceName,
  }));
}

async function extractDocx(buffer: Buffer, sourceName: string) {
  const result = await mammoth.extractRawText({ buffer });
  if (!result.value.trim()) throw new Error("DOCX has no extractable text");
  const pieces = await chunkContent(result.value);
  return pieces.map((content, chunkIndex) => ({
    content,
    checksum: createHash(content),
    chunkIndex,
    sourceName,
  }));
}

export async function extractFileToDrafts({
  buffer,
  sourceType,
  sourceName,
}: {
  buffer: Buffer;
  sourceType: KnowledgeFileType;
  sourceName: string;
}): Promise<ChunkDraft[]> {
  switch (sourceType) {
    case "json":
      return extractJson(buffer, sourceName);
    case "csv":
      return extractCsv(buffer, sourceName);
    case "xlsx":
      return extractExcel(buffer, sourceName);
    case "pdf":
      return extractPdf(buffer, sourceName);
    case "docx":
      return extractDocx(buffer, sourceName);
    default:
      throw new Error("Unsupported file type");
  }
}
