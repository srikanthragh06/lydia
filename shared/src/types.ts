// The signed-in user, as returned by the API (e.g. POST /auth/google, GET /auth/me).
export interface User {
    id: number;
    googleId: string;
    emailId: string;
    name: string | null;
    picture: string | null;
}

// A conversation, as returned by the API. Timestamps are ISO strings since Date objects
// serialize to strings over JSON.
export interface Conversation {
    id: number;
    userId: number;
    title: string | null;
    createdAt: string;
    updatedAt: string;
}
