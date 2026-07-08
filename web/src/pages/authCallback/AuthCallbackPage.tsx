import { useEffect } from "react";

const AuthCallbackPage = () => {
    // Verifies the OAuth state Google redirected back with against the one stored before
    // redirecting, then reads the authorization code for exchange with the backend. Runs once on mount.
    useEffect(() => {
        // verify google auth state
        const params = new URLSearchParams(window.location.search);
        const stateFromURL = params.get("state");
        const stateFromLocalStorage = localStorage.getItem("googleAuthState");
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

        // send auth api to server using auth code
        const googleAuthCode = params.get("code");
    }, []);

    return (
        <div
            className="w-full h-full text-white 
        flex flex-col items-center justify-center"
        >
            auth callback
        </div>
    );
};

export default AuthCallbackPage;
