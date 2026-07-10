import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
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
// belongs to the user, sends the full history plus the new prompt to the model, then persists
// both the user and assistant messages together and returns the assistant's reply.
export async function sendMessage(
    userId: number,
    conversationId: number,
    prompt: string,
) {
    // make sure this conversation actually belongs to the requesting user
    const conversation = await getConversationForUser(conversationId, userId);
    if (!conversation) {
        throw new Error("Conversation not found");
    }

    // build the full message history plus the new user prompt, and get the model's reply
    const history = await getMessagesForConversation(conversationId);
    const { text: content } = await generateText({
        model: anthropic("claude-haiku-4-5-20251001"),
        messages: [
            ...history.map((message) => ({
                role: message.role,
                content: message.content,
            })),
            { role: "user" as const, content: prompt },
        ],
    });

    // persist the user prompt and the assistant's reply together, and bump the conversation's
    // updatedAt so the sidebar reflects the new activity
    await db.transaction().execute(async (trx) => {
        await trx
            .insertInto("messages")
            .values({ conversationId, role: "user", content: prompt })
            .execute();

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
