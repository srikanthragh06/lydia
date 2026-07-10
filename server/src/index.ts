import path from "path";
import { fileURLToPath } from "url";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { migrate } from "./database/migrate";
import { authRouter } from "./routers/auth";
import { conversationsRouter } from "./routers/conversations";

// Migrations sit as a sibling of wherever this file itself is running from: src/migrations in
// dev (tsx runs src/index.ts directly), or dist/migrations once built (tsc mirrors migrations
// into dist alongside the bundled index.js).
const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
    // configure server
    const app = new Hono();

    // allow the client origin to send/receive cookies cross-origin
    app.use(
        "*",
        cors({
            origin: process.env.CLIENT_URL!,
            credentials: true,
        }),
    );

    app.get("/health", (c) => {
        return c.json({ message: "ok" });
    });

    // mount auth routes
    app.route("/auth", authRouter);

    // mount conversation routes
    app.route("/conversations", conversationsRouter);

    // catch-all for errors thrown/uncaught in any route handler
    app.onError((err, c) => {
        console.error(err);
        return c.json({ error: "Internal server error" }, 500);
    });

    // db migration
    const migrationSuccess = await migrate(path.join(__dirname, "migrations"));
    if (!migrationSuccess) {
        throw new Error("Postgres Migration failed!");
    }

    // server app on port
    const PORT = 3000;
    serve({ fetch: app.fetch, port: PORT });
})();
