"use server"
import { generateEmbeddings } from "@/lib/embeddings"
import db from "@/connector/db.drizzle"
import { embeddingDocumentTable, EmbeddingDocumentType, EmbeddingDocumentSchema } from "@/schema"
import { loadScrapedData } from "../lib/scrape-page-url"
// import { loadDocTextFile } from "../lib/extract-text-file"
import { loadJsonFile } from "@/lib/extract-text-json"
import fs from "fs"


export async function loadMindChampsData() {
  try {
    console.log("Loading MindChamps data...")

    const chunks: EmbeddingDocumentType["create"][] = []
    // == Section 1: Scraping and chunking content from MindChamps URLs

    await loadScrapedData().then(data => chunks.push(...data))

    // == Section 2: Extracting docx content and chunking

    // await loadDocTextFile().then(data => chunks.push(...data))


    // == Section 3: Extracting json content and chunking
    await loadJsonFile().then(data => chunks.push(...data))



    // == Section 4: Generating embeddings and inserting into the database

    const totalChunks = chunks.length
    console.log(`Total chunks loaded: ${totalChunks}`)

    const embeddings = await generateEmbeddings(
      chunks.map((chunk) => chunk.text)
    )

    const records: EmbeddingDocumentType["create"][] = chunks.map((chunk, index) => EmbeddingDocumentSchema.create.parse({
      text: chunk.text,
      sourceType: chunk.sourceType,
      source: chunk.source,
      chunkIndex: chunk.chunkIndex,
      hash: chunk.hash,
      metaData: chunk?.metaData,
      embedding: embeddings[index]
    }))


    console.log({ records })

    // if (process.env.NODE_ENV === "development") {
    //   await fs.promises.writeFile(
    //     "records.json",
    //     JSON.stringify(records, null, 2)
    //   );
    // }
    // Insert records into the database
    await db.insert(embeddingDocumentTable).values(records)

    console.log("Embeddings inserted into the database successfully.")

    return {
      success: true,
      message:
        "Created embeddings and inserted into the database successfully.",
    }
  } catch (error) {
    console.error("Error loading MindChamps data:", error)
    throw new Error("Failed to load MindChamps data")
  }
}


