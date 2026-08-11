"use server"
import { chunkContent } from "@/actions/chunk-load/chunking"
import { extractTextFromDocx } from "@/actions/chunk-load/extract-docx"
import { EmbeddingDocumentType } from "@/schema"
import path from "path"
import { createHash } from "../../lib/utils"

export async function loadDocTextFile() {
  try {
    console.log("Section 2: Extracting docx content and chunking")
    const recoards: EmbeddingDocumentType["create"][] = []

    const rootPath = path.join(process.cwd(), "docs")
    const docxFilePath = path.join(rootPath, "mindchamps.docx")

    const content = await extractTextFromDocx(docxFilePath)
    const resultChunk = await chunkContent(content.text)

    for (let i = 0; i < resultChunk.length; i++) {
      recoards.push({
        text: resultChunk[i],
        source: docxFilePath,
        sourceType: "docx",
        chunkIndex: i,
        hash: createHash(resultChunk[i]),
      })
    }
    console.log(`embedded docx content from ${resultChunk.length} chunks`)

    console.log("MindChamps docx content loaded successfully.")
    return recoards
  } catch (error) {
    console.error("Error reading text file:", error)
    throw new Error("Failed to read text file")
  }
}
