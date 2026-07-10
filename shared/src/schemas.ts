import { z } from "zod";

// Body shape for POST /auth/google: the authorization code Google redirected back to the client.
export const googleSignInSchema = z.object({
    code: z.string().min(1),
});
export type GoogleSignInRequest = z.infer<typeof googleSignInSchema>;

// Body shape for POST /conversations/:conversationId/messages: the user's prompt to send to
// the model. Capped at ~20,000 characters, a rough estimate (~4 chars/token) for a 5,000 token
// budget, matching the assistant's own max output tokens.
export const sendMessageSchema = z.object({
    prompt: z.string().min(1).max(20000),
});
export type SendMessageRequest = z.infer<typeof sendMessageSchema>;

// Body shape for PATCH /conversations/:conversationId: the conversation's new title.
export const updateConversationTitleSchema = z.object({
    title: z.string().min(1).max(64),
});
export type UpdateConversationTitleRequest = z.infer<
    typeof updateConversationTitleSchema
>;
