import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import type { ChatMessage } from "shared";
import { db } from "../database/postgres";
import { getConversationForUser } from "./conversationService";

// Returns all messages in the given conversation, oldest first.
async function getMessagesForConversation(conversationId: number) {
    return db
        .selectFrom("messages")
        .selectAll()
        .where("conversationId", "=", conversationId)
        .orderBy("createdAt", "asc")
        .execute();
}

// Sends a user's prompt in the context of an existing conversation: verifies the conversation
// belongs to the user, persists the prompt, streams the model's reply chunk by chunk via
// `onChunk`, then persists the assistant's full reply once streaming completes.
export async function sendMessage(
    userId: number,
    conversationId: number,
    prompt: string,
    onChunk: (chunk: string) => Promise<void>,
) {
    // make sure this conversation actually belongs to the requesting user
    const conversation = await getConversationForUser(conversationId, userId);
    if (!conversation) {
        throw new Error("Conversation not found");
    }

    // fetch the existing history before adding the new prompt, so the model sees it as context
    const history = await getMessagesForConversation(conversationId);

    // persist the user's prompt and bump the conversation's activity timestamp before calling
    // the model, so the prompt is recorded even if the model call fails
    await db.transaction().execute(async (trx) => {
        await trx
            .insertInto("messages")
            .values({ conversationId, role: "user", content: prompt })
            .execute();

        await trx
            .updateTable("conversations")
            .set({ updatedAt: new Date() })
            .where("id", "=", conversationId)
            .execute();
    });

    // stream the model's reply, forwarding each chunk via onChunk and accumulating the full text.
    // streamText doesn't throw from textStream on a failed call, it just ends the stream early,
    // so capture the error via onError and re-throw it after the loop to surface it as a failure.
    let streamError: unknown;
    const messages: ChatMessage[] = [
        ...history.map((message) => ({
            role: message.role,
            content: message.content,
        })),
        { role: "user", content: prompt },
    ];
    const result = streamText({
        model: anthropic("claude-haiku-4-5-20251001"),
        messages,
        onError: ({ error }) => {
            streamError = error;
        },
    });

    let content = "";
    for await (const chunk of result.textStream) {
        content += chunk;
        await onChunk(chunk);
    }

    if (streamError) {
        throw streamError instanceof Error
            ? streamError
            : new Error(String(streamError));
    }

    // persist the assistant's full reply and bump the conversation's activity timestamp again
    // now that streaming has completed
    await db.transaction().execute(async (trx) => {
        await trx
            .insertInto("messages")
            .values({ conversationId, role: "assistant", content })
            .execute();

        await trx
            .updateTable("conversations")
            .set({ updatedAt: new Date() })
            .where("id", "=", conversationId)
            .execute();
    });

    return content;
}
