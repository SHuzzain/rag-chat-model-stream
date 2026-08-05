import { chunkContent } from "@/lib/chunking"
import { EmbeddingDocumentType } from "@/schema"
import puppeteer from "puppeteer"
import { createHash } from "./utils"

const champsData = [
  "https://en.wikipedia.org/wiki/MindChamps",
  "https://www.mindchamps.org/the-mindchamps-story/our-team",
  "https://mindspace.mindchamps.org/the-champion-mindset-way/",
  "https://mindspace.mindchamps.org/mindspace-kinex-scholarship",
  "https://mindspace.mindchamps.org/our-space/",
  "https://www.mindchamps.org/enrichment/mindchamps-reading/our-curriculum/",
  "https://www.mindchamps.org/enrichment/mindchamps-writing/our-curriculum/",
  "https://www.mindchamps.org/enrichment/primary-success-programme/our-curriculum",
]

export async function loadScrapedData() {
  try {
    console.log("Section 1: Scraping and chunking content from MindChamps URLs")
    const recoards: EmbeddingDocumentType["create"][] = []
    for (let i = 0; i < champsData.length; i++) {
      const url = champsData[i]
      const content = await scrapePage(url)
      if (content) {
        const resultChunks = await chunkContent(content.text)
        for (const item of resultChunks) {
          recoards.push({
            text: item,
            source: url,
            sourceType: "url",
            chunkIndex: i,
            hash: createHash(item),
          })
        }
        console.log(`[INFO] embedded chunk ${i} content from ${resultChunks.length} chunks`)
      }
    }
    console.log("MindChamps data loaded successfully.")
    return recoards
  } catch (error) {
    console.error("Error scraping data:", error)
    throw new Error("Failed to scrape data")
  }
}

const scrapePage = async (url: string) => {
  const browser = await puppeteer.launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: "networkidle2" })
    const content = await page.evaluate(() => {
      document
        .querySelectorAll("script, style, nav, footer, header, noscript")
        .forEach((el) => el.remove())
      return {
        title: document.title,
        text: document.body.innerText.replace(/\s+/g, " ").trim(),
      }
    })
    await page.close()
    return content
  } catch (error) {
    console.error(`Error scraping page ${url}:`, error)
  } finally {
    await browser.close()
  }
}
