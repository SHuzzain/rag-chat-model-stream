"use server";
import fs from "fs";
import JSZip from "jszip";
import mammoth from "mammoth";
import path from "path/win32";

export async function extractTextFromDocx(filePath: string) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return {
      title: path.basename(filePath, path.extname(filePath)),
      text: result.value,
    };
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}

export async function extractImageFromDocxUsingJSZip(
  filePath: string,
  destinationFolder: string
): Promise<{ fileName: string; filePath: string }[]> {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const zip = await JSZip.loadAsync(fileBuffer);
    const imageFiles: { name: string; data: Buffer }[] = [];
    const result: { fileName: string; filePath: string }[] = [];

    for (const [fileName, file] of Object.entries(zip.files)) {
      if (fileName.startsWith("word/media/") && !file.dir) {
        const imageData = await file.async("nodebuffer");
        imageFiles.push({ name: fileName, data: imageData });
      }
    }
    for (const imageFile of imageFiles) {
      const outputFilePath = `${destinationFolder}/${imageFile.name.split("/").pop()}`;
      fs.writeFileSync(outputFilePath, imageFile.data);
      result.push({
        fileName: imageFile.name.split("/").pop()!,
        filePath: outputFilePath,
      });
    }
    return result;
  } catch (error) {
    console.error("Error extracting images from DOCX:", error);
    throw new Error("Failed to extract images from DOCX");
  }
}
