import { type ClassValue, clsx } from "clsx";
import crypto from "crypto";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createHash(text: string) {
  return crypto.createHash("sha256").update(text.trim()).digest("hex");
}
