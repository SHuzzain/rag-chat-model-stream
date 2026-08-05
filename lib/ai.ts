export type MessagePart =
  | { type: "text"; text?: string }
  | { type: "reasoning"; text?: string }
  | { type: string; [key: string]: unknown }

export type MessageLike = {
  id?: string
  role?: string
  content?: string | MessagePart[] | unknown
  parts?: MessagePart[] | unknown
  [key: string]: unknown
}

export function getMessageText(message: unknown): string {
  if (!message) return ""
  if (typeof message === "string") return message

  if (typeof message === "object" && message !== null) {
    const msg = message as Record<string, unknown>

    if (typeof msg.content === "string") {
      return msg.content
    }

    const parts = Array.isArray(msg.parts)
      ? msg.parts
      : Array.isArray(msg.content)
        ? msg.content
        : null

    if (parts) {
      return parts
        .filter((part): part is Record<string, unknown> => typeof part === "object" && part !== null && part.type === "text")
        .map((part) => (typeof part.text === "string" ? part.text : ""))
        .join("")
    }
  }

  return ""
}
