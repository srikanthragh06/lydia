import { Kysely } from "kysely";

export async function up(db: Kysely<any>) {
    await db.schema
        .createTable("users")
        .addColumn("id", "serial", (col) => col.primaryKey())
        .addColumn("googleId", "varchar(255)", (col) => col.notNull().unique())
        .addColumn("emailId", "varchar(255)", (col) => col.unique().notNull())
        .execute();
}

export async function down(db: Kysely<any>) {
    await db.schema.dropTable("users").execute();
}
