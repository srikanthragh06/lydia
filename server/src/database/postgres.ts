import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { Database } from "./schema";
import dotenv from "dotenv";

dotenv.config();

export const db = new Kysely<Database>({
    dialect: new PostgresDialect({
        pool: new Pool({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            // only enabled via DB_SSL, since local dev's docker-compose Postgres has no SSL at
            // all, while Supabase's pooler (used in production) requires it
            ssl:
                process.env.DB_SSL === "true"
                    ? { rejectUnauthorized: false }
                    : undefined,
        }),
    }),
});
