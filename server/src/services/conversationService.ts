import { db } from "../database/postgres";

// Creates a new, untitled conversation owned by the given user.
export async function createConversation(userId: number) {
    const conversation = await db
        .insertInto("conversations")
        .values({ userId, title: null })
        .returningAll()
        .executeTakeFirstOrThrow();

    return conversation;
}

// Returns all conversations owned by the given user, most recently updated first.
export async function getConversationsForUser(userId: number) {
    return db
        .selectFrom("conversations")
        .selectAll()
        .where("userId", "=", userId)
        .orderBy("updatedAt", "desc")
        .execute();
}

// Returns the conversation with the given id if it's owned by the given user, otherwise undefined.
export async function getConversationForUser(id: number, userId: number) {
    return db
        .selectFrom("conversations")
        .selectAll()
        .where("id", "=", id)
        .where("userId", "=", userId)
        .executeTakeFirst();
}
