import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.get("/health", (c) => {
    return c.json({ message: "ok" });
});

const PORT = 3000;
serve({ fetch: app.fetch, port: PORT });
