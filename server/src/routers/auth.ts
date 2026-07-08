import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { zValidator } from "@hono/zod-validator";
import { googleSignInSchema } from "../schemas/auth";
import { signInWithGoogle } from "../services/authService";
import { requireAuth } from "../middlewares/auth";

// Router for authentication-related endpoints, mounted at /auth in the main app.
export const authRouter = new Hono();

// Exchanges a Google OAuth authorization code for a session via authService, then sets the
// resulting token as an httpOnly auth cookie.
authRouter.post(
    "/google",
    zValidator("json", googleSignInSchema),
    async (c) => {
        const { code } = c.req.valid("json");

        try {
            const { user, token } = await signInWithGoogle(code);

            setCookie(c, "auth", token, {
                httpOnly: true,
                path: "/",
                sameSite: "Strict",
                secure: process.env.NODE_ENV === "production",
            });

            return c.json({ user });
        } catch (err) {
            console.error(err);
            return c.json({ error: (err as Error).message }, 400);
        }
    },
);

// Returns the currently signed-in user, verified via the auth cookie.
authRouter.get("/me", requireAuth, (c) => {
    const user = c.get("user");
    return c.json({ user });
});
