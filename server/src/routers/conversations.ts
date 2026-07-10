import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { sendMessageSchema, updateConversationTitleSchema } from "shared";
import { requireAuth } from "../middlewares/auth";
import {
    createConversation,
    getConversationForUser,
    getConversationsForUser,
    updateConversationTitle,
} from "../services/conversationService";
import { getMessagesForConversation, sendMessage } from "../services/aiService";

// Router for conversation-related endpoints, mounted at /conversations in the main app.
export const conversationsRouter = new Hono();

// Path param shape shared by every /:conversationId route below.
const conversationIdParamSchema = z.object({
    conversationId: z.coerce.number().int().positive(),
});

// Creates a new, untitled conversation owned by the signed-in user.
conversationsRouter.post("/", requireAuth, async (c) => {
    const user = c.get("user");
    const conversation = await createConversation(user.id);
    return c.json({ conversation }, 201);
});

// Lists all conversations owned by the signed-in user, most recently updated first.
conversationsRouter.get("/", requireAuth, async (c) => {
    const user = c.get("user");
    const conversations = await getConversationsForUser(user.id);
    return c.json({ conversations });
});

// Renames the given conversation.
conversationsRouter.patch(
    "/:conversationId",
    requireAuth,
    zValidator("param", conversationIdParamSchema),
    zValidator("json", updateConversationTitleSchema),
    async (c) => {
        const user = c.get("user");
        const { conversationId } = c.req.valid("param");
        const { title } = c.req.valid("json");

        const conversation = await getConversationForUser(
            conversationId,
            user.id,
        );
        if (!conversation) {
            return c.json({ error: "Conversation not found" }, 404);
        }

        const updated = await updateConversationTitle(conversationId, title);
        return c.json({ conversation: updated });
    },
);

// Lists all messages in the given conversation, oldest first.
conversationsRouter.get(
    "/:conversationId/messages",
    requireAuth,
    zValidator("param", conversationIdParamSchema),
    async (c) => {
        const user = c.get("user");
        const { conversationId } = c.req.valid("param");

        const conversation = await getConversationForUser(
            conversationId,
            user.id,
        );
        if (!conversation) {
            return c.json({ error: "Conversation not found" }, 404);
        }

        const messages = await getMessagesForConversation(conversationId);
        return c.json({ messages });
    },
);

// Streams the assistant's reply to the user's prompt in the given conversation, as
// Server-Sent Events: a "chunk" event per piece of text as it arrives, or a single "error"
// event with a generic message if the model call fails partway through.
conversationsRouter.post(
    "/:conversationId/messages",
    requireAuth,
    zValidator("param", conversationIdParamSchema),
    zValidator("json", sendMessageSchema),
    async (c) => {
        const user = c.get("user");
        const { conversationId } = c.req.valid("param");
        const { prompt } = c.req.valid("json");

        // check ownership before starting the SSE stream — once streamSSE sends its 200,
        // there's no falling back to a proper HTTP error status
        const conversation = await getConversationForUser(
            conversationId,
            user.id,
        );
        if (!conversation) {
            return c.json({ error: "Conversation not found" }, 404);
        }

        return streamSSE(c, async (stream) => {
            try {
                await sendMessage(conversationId, prompt, async (chunk) => {
                    await stream.writeSSE({ event: "chunk", data: chunk });
                });
            } catch (err) {
                // the stream has already started (200 already sent, so we can't fall back to
                // an HTTP error status) — log the real error, but only send a generic message
                // to the client rather than leaking internal error details
                console.error(err);
                await stream.writeSSE({
                    event: "error",
                    data: "Something went wrong",
                });
            }
        });
    },
);
