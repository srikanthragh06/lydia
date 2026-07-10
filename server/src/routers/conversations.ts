import { Hono } from "hono";
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

// Sends the user's prompt in the given conversation and returns the assistant's reply.
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

        const content = await sendMessage(user.id, conversationId, prompt);
        return c.json({ content });
    },
);
