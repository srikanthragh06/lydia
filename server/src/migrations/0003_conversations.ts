import { Kysely, sql } from "kysely";

// Creates the conversations table, one row per chat thread owned by a user.
export async function up(db: Kysely<any>) {
    await db.schema
        .createTable("conversations")
        .addColumn("id", "serial", (col) => col.primaryKey())
        .addColumn("userId", "integer", (col) =>
            col.notNull().references("users.id"),
        )
        .addColumn("title", "varchar(255)")
        .addColumn("createdAt", "timestamp", (col) =>
            col.notNull().defaultTo(sql`now()`),
        )
        .addColumn("updatedAt", "timestamp", (col) =>
            col.notNull().defaultTo(sql`now()`),
        )
        .execute();
}

// Reverts the conversations table created by `up`.
export async function down(db: Kysely<any>) {
    await db.schema.dropTable("conversations").execute();
}
