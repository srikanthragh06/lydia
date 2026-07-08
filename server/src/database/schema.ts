import { Generated } from "kysely";

export interface Database {
    users: UsersTable;
}

export interface UsersTable {
    id: Generated<number>;
    googleId: string;
    emailId: string;
    name: string | null;
    picture: string | null;
}
