import { Kysely, sql } from "kysely";

// Creates the modelResponses table, one row per model's raw answer that fed into an assistant
// message's synthesized reply.
export async function up(db: Kysely<any>) {
    await db.schema
        .createTable("modelResponses")
        .addColumn("id", "serial", (col) => col.primaryKey())
        .addColumn("messageId", "integer", (col) =>
            col.notNull().references("messages.id"),
        )
        .addColumn("model", "text", (col) => col.notNull())
        .addColumn("content", "text")
        .addColumn("error", "text")
        .addColumn("createdAt", "timestamp", (col) =>
            col.notNull().defaultTo(sql`now()`),
        )
        .execute();
}

// Reverts the modelResponses table created by `up`.
export async function down(db: Kysely<any>) {
    await db.schema.dropTable("modelResponses").execute();
}
