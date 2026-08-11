"use server"
import { EmbeddingDocumentType } from "@/schema"
import fs from "fs"
import path from "path"
import { createHash } from "../../lib/utils"

export async function loadJsonFile() {
    try {
        console.log("Section 3: Extracting json content and chunking")
        const recoards: EmbeddingDocumentType["create"][] = []

        const fileName = "mindchamps-faq"
        const rootPath = path.join(process.cwd(), "docs")
        const jsonFilePath = path.join(rootPath, `${fileName}.json`)
        const content = await fs.promises.readFile(jsonFilePath, "utf-8")
        if (content) {
            const data = JSON.parse(content) as Pick<EmbeddingDocumentType["select"], "metaData">["metaData"][]
            for (let i = 0; i < data.length; i++) {
                if (data[i]) {
                    const { question, answer, topic } = data[i]!
                    const result = `${topic}  ${question} ${answer}`
                    recoards.push({
                        text: result,
                        source: fileName,
                        sourceType: "json",
                        chunkIndex: i,
                        hash: createHash(result),
                        metaData: { question, answer, topic },
                    })
                }
            }
            console.log(`[INFO] embedded json content from ${data.length} chunks`)
            console.log("MindChamps json content loaded successfully.")
        }
        return recoards
    } catch (error) {
        console.error("Error reading json file:", error)
        throw new Error("Failed to read json file")
    }
}