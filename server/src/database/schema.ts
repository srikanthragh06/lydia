import { Generated } from "kysely";

export interface Database {
    users: UsersTable;
    conversations: ConversationsTable;
    messages: MessagesTable;
    modelResponses: ModelResponsesTable;
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

export interface MessagesTable {
    id: Generated<number>;
    conversationId: number;
    role: "user" | "assistant";
    content: string;
    createdAt: Generated<Date>;
}

export interface ModelResponsesTable {
    id: Generated<number>;
    messageId: number;
    model: string;
    content: string | null;
    error: string | null;
    createdAt: Generated<Date>;
}
