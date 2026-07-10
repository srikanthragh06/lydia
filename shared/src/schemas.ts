import { z } from "zod";

// Body shape for POST /auth/google: the authorization code Google redirected back to the client.
export const googleSignInSchema = z.object({
    code: z.string().min(1),
});
export type GoogleSignInRequest = z.infer<typeof googleSignInSchema>;

// Body shape for POST /conversations/:conversationId/messages: the user's prompt to send to
// the model.
export const sendMessageSchema = z.object({
    prompt: z.string().min(1).max(10000),
});
export type SendMessageRequest = z.infer<typeof sendMessageSchema>;
