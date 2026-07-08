import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { migrate } from "./database/migrate";
import { authRouter } from "./routers/auth";

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

    // db migration
    const migrationSuccess = await migrate();
    if (!migrationSuccess) {
        throw new Error("Postgres Migration failed!");
    }

    // server app on port
    const PORT = 3000;
    serve({ fetch: app.fetch, port: PORT });
})();
