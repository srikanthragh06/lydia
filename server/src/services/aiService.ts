import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

// Sends the user's prompt to Claude Haiku and returns its response text.
export async function sendMessage(prompt: string) {
    const { text } = await generateText({
        model: anthropic("claude-haiku-4-5-20251001"),
        prompt,
    });

    return text;
}
