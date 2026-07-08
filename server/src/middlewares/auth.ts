import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { Selectable } from "kysely";
import { UsersTable } from "../database/schema";

// Verifies the JWT stored in the auth cookie and attaches the decoded user onto the request
// context; responds 401 if the cookie is missing or the token is invalid/expired.
export const requireAuth = createMiddleware<{
    Variables: { user: Selectable<UsersTable> };
}>(async (c, next) => {
    // read the auth cookie
    const token = getCookie(c, "auth");
    if (!token) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    // verify the JWT and attach the decoded user for downstream handlers
    try {
        const payload = await verify(token, process.env.JWT_SECRET!, "HS256");
        c.set("user", payload as Selectable<UsersTable>);
    } catch {
        return c.json({ error: "Unauthorized" }, 401);
    }

    await next();
});
