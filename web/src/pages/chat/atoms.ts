import { atom } from "jotai";

// The conversation currently open in the chat window, shared between the sidebar (which sets
// it on click/new-chat) and the chat window (which reads it to know what to load/send to).
export const selectedConversationIdAtom = atom<number | null>(null);
