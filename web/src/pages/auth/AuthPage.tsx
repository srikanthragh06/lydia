import { FcGoogle } from "react-icons/fc";
import Page from "../../components/Page";

const AuthPage = () => {
    // Redirects to Google's OAuth consent screen, first generating and storing a random state
    // token so the callback page can verify the redirect back wasn't forged (CSRF protection).
    const handleGoogleSignIn = async () => {
        //get google client id
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
            throw new Error(`No google client id present: ${clientId}`);
        }

        // generate google auth state
        const googleAuthState = btoa(
            String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))),
        );
        localStorage.setItem("googleAuthState", googleAuthState);

        // build google signin url
        const googleAuthURL = "https://accounts.google.com/o/oauth2/auth";

        const redirectURI = `${window.location.origin}/auth/callback`;
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectURI,
            response_type: "code",
            access_type: "offline",
            scope: "openid email profile",
            state: googleAuthState,
        });
        window.location.assign(`${googleAuthURL}?${params}`);
    };

    return (
        <Page className="items-center justify-center " requiresAuth={false}>
            <div className=" flex flex-col items-center space-y-4">
                <div>Please sign in to continue</div>
                <button
                    onClick={() => handleGoogleSignIn()}
                    className="flex gap-2 items-center text-xl 
                bg-white px-3 py-2 text-black rounded-lg
                cursor-pointer hover:opacity-90 transition"
                >
                    <FcGoogle />
                    Sign in with Google
                </button>
            </div>
        </Page>
    );
};

export default AuthPage;
