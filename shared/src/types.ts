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

// A message, as returned by the API. Timestamps are ISO strings since Date objects serialize
// to strings over JSON.
export interface Message {
    id: number;
    conversationId: number;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
}

// A role/content pair, without the persisted-message fields (id/conversationId/createdAt).
// Used wherever just the conversational turn itself matters: the model call's message history,
// and the chat window's in-progress (possibly still-streaming, not-yet-persisted) messages.
export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

// One fan-out model's raw answer to a prompt, or the error if that model's call failed.
export interface ModelResponse {
    model: string;
    content: string | null;
    error: string | null;
}
