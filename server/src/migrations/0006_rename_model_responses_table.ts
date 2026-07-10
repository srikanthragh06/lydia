import { Kysely, sql } from "kysely";

// Renames modelResponses to model_responses, to match the multi-word table naming convention.
export async function up(db: Kysely<any>) {
    await sql`alter table "modelResponses" rename to "model_responses"`.execute(
        db,
    );
}

// Reverts the rename.
export async function down(db: Kysely<any>) {
    await sql`alter table "model_responses" rename to "modelResponses"`.execute(
        db,
    );
}
