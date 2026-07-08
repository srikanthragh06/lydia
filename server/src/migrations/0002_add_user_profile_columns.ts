import { Kysely } from "kysely";

// Adds nullable name/picture columns to users, populated from the Google id_token on sign-in.
export async function up(db: Kysely<any>) {
    await db.schema
        .alterTable("users")
        .addColumn("name", "varchar(255)")
        .execute();
    await db.schema.alterTable("users").addColumn("picture", "text").execute();
}

// Reverts the name/picture columns added by `up`.
export async function down(db: Kysely<any>) {
    await db.schema.alterTable("users").dropColumn("name").execute();
    await db.schema.alterTable("users").dropColumn("picture").execute();
}
