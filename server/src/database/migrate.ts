import { Migrator, FileMigrationProvider } from "kysely";
import { promises as fs } from "fs";
import path from "path";
import { db } from "./postgres";

export const migrate = async () => {
    const migrator = new Migrator({
        db,
        provider: new FileMigrationProvider({
            fs,
            path,
            migrationFolder: path.join(process.cwd(), "src", "migrations"),
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
