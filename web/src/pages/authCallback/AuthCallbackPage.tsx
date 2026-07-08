import { useEffect, useState } from "react";
import { api } from "../../lib/axios";

const AuthCallbackPage = () => {
    const [status, setStatus] = useState<
        "signing-in" | "failed" | "success"
    >("signing-in"); // current stage of the sign-in exchange, drives the message shown to the user

    // Verifies the OAuth state Google redirected back with against the one stored before
    // redirecting, then exchanges the authorization code with the backend to complete sign-in.
    // Runs once on mount.
    useEffect(() => {
        const run = async () => {
            try {
                // verify google auth state
                const params = new URLSearchParams(window.location.search);
                const stateFromURL = params.get("state");
                const stateFromLocalStorage =
                    localStorage.getItem("googleAuthState");
                if (!stateFromLocalStorage) {
                    throw new Error("No google auth state in local storage");
                }
                if (!stateFromURL || stateFromURL !== stateFromLocalStorage) {
                    throw new Error(
                        `Missing or incorrect google auth state: ${stateFromURL}`,
                    );
                }
                // state is single-use; clear it now that it has been verified
                localStorage.removeItem("googleAuthState");

                // send the auth code to the server to complete sign-in
                const googleAuthCode = params.get("code");
                await api.post("/auth/google", { code: googleAuthCode });

                setStatus("success");
            } catch (err) {
                console.error(err);
                setStatus("failed");
            }
        };
        run();
    }, []);

    // Once sign-in succeeds, redirects to the home page after a short delay so the success
    // message is visible; runs whenever status changes.
    useEffect(() => {
        if (status !== "success") return;
        const timeout = setTimeout(() => {
            window.location.assign("/");
        }, 1000);
        return () => clearTimeout(timeout);
    }, [status]);

    return (
        <div
            className="w-full h-full text-white
        flex flex-col items-center justify-center"
        >
            {status === "signing-in" && "Signing in..."}
            {status === "failed" && "Sign in failed :("}
            {status === "success" && "Signed in successfully :)"}
        </div>
    );
};

export default AuthCallbackPage;
