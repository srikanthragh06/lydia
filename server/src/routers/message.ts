import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { sendMessageSchema } from "shared";
import { requireAuth } from "../middlewares/auth";
import { sendMessage } from "../services/aiService";

// Router for message-related endpoints, mounted at /message in the main app.
export const messageRouter = new Hono();

// Sends the user's prompt to the model and returns its response.
messageRouter.post(
    "/",
    requireAuth,
    zValidator("json", sendMessageSchema),
    async (c) => {
        const { prompt } = c.req.valid("json");
        const content = await sendMessage(prompt);
        return c.json({ content });
    },
);
