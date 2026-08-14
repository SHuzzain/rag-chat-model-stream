import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
  separators: [" "],
});

export async function chunkContent(content: string) {
  return textSplitter.splitText(content.trim());
}
