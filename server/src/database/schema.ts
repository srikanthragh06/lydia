import { Generated } from "kysely";

export interface Database {
    users: UsersTable;
    conversations: ConversationsTable;
}

export interface UsersTable {
    id: Generated<number>;
    googleId: string;
    emailId: string;
    name: string | null;
    picture: string | null;
}

export interface ConversationsTable {
    id: Generated<number>;
    userId: number;
    title: string | null;
    createdAt: Generated<Date>;
    updatedAt: Generated<Date>;
}
