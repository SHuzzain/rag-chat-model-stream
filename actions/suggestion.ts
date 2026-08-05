import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { generateEmbedding } from "@/lib/embeddings";
import { ragSearch } from "@/lib/rag-search";

const SuggestionSchema = z.object({
    suggestions: z.array(z.string()).max(3),
});


export async function generateSuggestions(
    question: string,
    answer: string
) {
    if (!question || !answer || answer.trim().length === 0) {
        return { suggestions: [] };
    }

    try {
        const embedding = await generateEmbedding(question);
        const searchResults = await ragSearch({
            queryEmbedding: embedding,
            topK: 10,
        });

        if (!searchResults || searchResults.length === 0) {
            return { suggestions: [] };
        }

        const contextText = searchResults
            .map(
                (r, idx) =>
                    `[Chunk ${idx + 1}] (${r.source})\n${r.text}`
            )
            .join("\n\n");

        const { output } = await generateText({
            model: openai("gpt-4o-mini"),
            output: Output.object({ schema: SuggestionSchema }),
            system: `You generate follow-up questions for a Knowledge Base RAG Chatbot.

CRITICAL RULES:
- Suggest ONLY questions that are directly answerable using the provided Knowledge Base Context below.
- Do NOT hallucinate topics or suggest questions outside of the provided context.
- Keep questions short (under 12 words).
- Do not repeat the user's current question.
- Generate at most 3 questions.`,
            prompt: `User Question: "${question}"

Assistant Answer: "${answer}"

Knowledge Base Context (Available facts to base suggestions on):
${contextText}`,
        });

        return output;
    } catch (error) {
        console.error("[Suggestions] Error generating grounded suggestions:", error);
        return { suggestions: [] };
    }
}