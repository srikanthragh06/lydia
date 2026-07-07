import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { migrate } from "./database/migrate";

(async () => {
    // configure server
    const app = new Hono();

    app.get("/health", (c) => {
        return c.json({ message: "ok" });
    });

    // db migration
    const migrationSuccess = await migrate();
    if (!migrationSuccess) {
        throw new Error("Postgres Migration failed!");
    }

    // server app on port
    const PORT = 3000;
    serve({ fetch: app.fetch, port: PORT });
})();
