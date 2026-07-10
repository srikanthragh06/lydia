import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { sendMessageSchema } from "shared";
import { requireAuth } from "../middlewares/auth";
import {
    createConversation,
    getConversationsForUser,
} from "../services/conversationService";
import { sendMessage } from "../services/aiService";

// Router for conversation-related endpoints, mounted at /conversations in the main app.
export const conversationsRouter = new Hono();

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

// Streams the assistant's reply to the user's prompt in the given conversation, as
// Server-Sent Events: a "chunk" event per piece of text as it arrives, or a single "error"
// event with a generic message if the model call fails partway through.
conversationsRouter.post(
    "/:conversationId/messages",
    requireAuth,
    zValidator(
        "param",
        z.object({ conversationId: z.coerce.number().int().positive() }),
    ),
    zValidator("json", sendMessageSchema),
    async (c) => {
        const user = c.get("user");
        const { conversationId } = c.req.valid("param");
        const { prompt } = c.req.valid("json");

        return streamSSE(c, async (stream) => {
            try {
                await sendMessage(
                    user.id,
                    conversationId,
                    prompt,
                    async (chunk) => {
                        await stream.writeSSE({ event: "chunk", data: chunk });
                    },
                );
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
