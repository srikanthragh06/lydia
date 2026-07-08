import { Hono } from "hono";
import { requireAuth } from "../middlewares/auth";
import {
    createConversation,
    getConversationsForUser,
} from "../services/conversationService";

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
