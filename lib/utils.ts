import { type ClassValue, clsx } from "clsx";
import crypto from "crypto";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createHash(text: string) {
  return crypto.createHash("sha256").update(text.trim()).digest("hex");
}

export const cacheLifetimes = {
  oneHour: 60 * 60,
  oneDay: 60 * 60 * 24,
  oneWeek: 60 * 60 * 24 * 7,
  oneMonth: 60 * 60 * 24 * 30,
  oneYear: 60 * 60 * 24 * 365,
};
