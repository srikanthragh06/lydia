import { createMiddleware } from "hono/factory";
import type { User } from "shared";

// Max requests a single user can make within RATE_LIMIT_WINDOW_MS.
const RATE_LIMIT_MAX = 300;

// Fixed window size, in ms (1 hour).
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

// Per-user request count within the current fixed window.
const requestCounts = new Map<number, { count: number; windowStart: number }>();

// Fixed-window rate limiter, keyed by user.id, guarding the AI message endpoint from a single
// user spamming it. Disabled entirely unless RATE_LIMIT_ENABLED=true, so it can be toggled off
// without a deploy. Must run after requireAuth, since it relies on the "user" context variable.
export const rateLimitAi = createMiddleware<{ Variables: { user: User } }>(
    async (c, next) => {
        // bypass entirely when the feature is toggled off via env var
        if (process.env.RATE_LIMIT_ENABLED !== "true") {
            return next();
        }

        const userId = c.get("user").id;
        const now = Date.now();

        // look up (or start) this user's window, resetting it if it's expired
        let entry = requestCounts.get(userId);
        if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
            entry = { count: 0, windowStart: now };
            requestCounts.set(userId, entry);
        }

        // reject once the user has hit the limit for this window
        if (entry.count >= RATE_LIMIT_MAX) {
            return c.json({ error: "Too many requests" }, 429);
        }

        // consume one request from this window and let it through
        entry.count++;
        await next();
    },
);
