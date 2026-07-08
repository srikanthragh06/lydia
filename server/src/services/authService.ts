import { sign } from "hono/jwt";
import { db } from "../database/postgres";

// Decodes a JWT's payload without verifying its signature (the id_token is obtained via a
// direct server-to-server exchange with Google over HTTPS, so it's trusted here).
function decodeJwtPayload(token: string) {
    const payload = token.split(".")[1];
    const json = Buffer.from(payload, "base64url").toString("utf-8");
    return JSON.parse(json);
}

// Exchanges a Google OAuth authorization code for tokens, decodes the user's identity out of
// the id_token, upserts the user row, and returns the user along with a signed session token.
export async function signInWithGoogle(code: string) {
    if (!code) {
        throw new Error("Missing code");
    }

    // exchange the authorization code for Google tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: `${process.env.CLIENT_URL}/auth/callback`,
        }),
    });

    if (!tokenRes.ok) {
        throw new Error("Failed to exchange code");
    }

    const tokenData = await tokenRes.json();

    // pull identity fields out of the id_token payload
    const { sub, email, name, picture } = decodeJwtPayload(tokenData.id_token);

    // upsert the user by googleId
    const user = await db
        .insertInto("users")
        .values({ googleId: sub, emailId: email, name, picture })
        .onConflict((oc) =>
            oc
                .column("googleId")
                .doUpdateSet({ emailId: email, name, picture }),
        )
        .returningAll()
        .executeTakeFirstOrThrow();

    // sign the user's details into a JWT so the cookie value can't be forged or tampered with by the client
    const token = await sign(
        { ...user, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
        process.env.JWT_SECRET!,
    );

    return { user, token };
}
