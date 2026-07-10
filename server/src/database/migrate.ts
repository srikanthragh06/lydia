import { Migrator, FileMigrationProvider } from "kysely";
import { promises as fs } from "fs";
import path from "path";
import { db } from "./postgres";

// Runs every pending migration found in migrationFolder against the database. Callers compute
// migrationFolder relative to the entry point's own location (see index.ts) rather than this
// file's, since bundling for production inlines this file into the entry point, which would
// otherwise make a self-relative path resolve to the wrong directory.
export const migrate = async (migrationFolder: string) => {
    const migrator = new Migrator({
        db,
        provider: new FileMigrationProvider({
            fs,
            path,
            migrationFolder,
        }),
    });

    const { error, results } = await migrator.migrateToLatest();

    if (results) {
        for (const result of results) {
            console.log(
                `Migration ${result.migrationName} was ${result.status}`,
            );
        }
    }
    if (error) {
        console.error(error);
        return false;
    } else {
        return true;
    }
};
