import { chunkContent } from "@/lib/chunking"
import { extractTextFromDocx } from "@/lib/extract-docx"
import path from "path"
import type {} from "./procress-load"

export async function loadDocTextFile(chunks: Chunk[]) {
  try {
    console.log("Section 2: Extracting docx content and chunking")
    const rootPath = path.join(process.cwd(), "docs")
    const docxFilePath = path.join(rootPath, "mindchamps.docx")
    const content = await extractTextFromDocx(docxFilePath)
    if (content) {
      chunks.push(...(await chunkContent(content.text)))
    }
    console.log(`embedded docx content from ${chunks.length} chunks`)

    console.log("MindChamps docx content loaded successfully.")
  } catch (error) {
    console.error("Error reading text file:", error)
    throw new Error("Failed to read text file")
  }
}
