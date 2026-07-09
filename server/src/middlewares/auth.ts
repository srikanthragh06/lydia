import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import type { User } from "shared";
import { db } from "../database/postgres";

// Verifies the JWT stored in the auth cookie, looks up the user it identifies, and attaches
// that user onto the request context; responds 401 if the cookie is missing, the token is
// invalid/expired, the payload doesn't carry a valid id, or the user no longer exists.
export const requireAuth = createMiddleware<{
    Variables: { user: User };
}>(async (c, next) => {
    // read the auth cookie
    const token = getCookie(c, "auth");
    if (!token) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    // verify the JWT, confirm it carries a valid id, and look up the current user for that id
    try {
        const payload = await verify(token, process.env.JWT_SECRET!, "HS256");
        if (typeof payload.id !== "number") {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const user = await db
            .selectFrom("users")
            .selectAll()
            .where("id", "=", payload.id)
            .executeTakeFirst();

        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        c.set("user", user);
    } catch {
        return c.json({ error: "Unauthorized" }, 401);
    }

    await next();
});
