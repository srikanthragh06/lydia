import { Hono } from "hono";

// Router for authentication-related endpoints, mounted at /auth in the main app.
export const authRouter = new Hono();

// Placeholder for exchanging a Google OAuth authorization code for a session; token exchange is not yet implemented.
authRouter.post("/google", (c) => {
    return c.json({});
});
