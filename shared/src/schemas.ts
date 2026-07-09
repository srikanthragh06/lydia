import { z } from "zod";

// Body shape for POST /auth/google: the authorization code Google redirected back to the client.
export const googleSignInSchema = z.object({
    code: z.string().min(1),
});
export type GoogleSignInRequest = z.infer<typeof googleSignInSchema>;
