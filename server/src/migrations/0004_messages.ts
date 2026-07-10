import { Kysely, sql } from "kysely";

// Creates the messages table, one row per user or assistant message in a conversation.
export async function up(db: Kysely<any>) {
    await db.schema
        .createTable("messages")
        .addColumn("id", "serial", (col) => col.primaryKey())
        .addColumn("conversationId", "integer", (col) =>
            col.notNull().references("conversations.id"),
        )
        .addColumn("role", "varchar(20)", (col) => col.notNull())
        .addColumn("content", "text", (col) => col.notNull())
        .addColumn("createdAt", "timestamp", (col) =>
            col.notNull().defaultTo(sql`now()`),
        )
        .addCheckConstraint(
            "messages_role_check",
            sql`role in ('user', 'assistant')`,
        )
        .execute();
}

// Reverts the messages table created by `up`.
export async function down(db: Kysely<any>) {
    await db.schema.dropTable("messages").execute();
}
