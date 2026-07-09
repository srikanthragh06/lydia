import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "shared";
import { api } from "../lib/axios";

// Verifies the current session by calling /auth/me on mount, redirecting to /auth if it fails.
export function useAuth(requiresAuth: boolean) {
    const [authStatus, setAuthStatus] = useState<
        "noAuthRequired" | "loading" | "success" | "failed"
    >("noAuthRequired"); // stage of the session check; stays "noAuthRequired" if requiresAuth is false

    const [user, setUser] = useState<User | null>(null); // signed-in user once the auth check succeeds; null while loading or unauthenticated

    const navigate = useNavigate();

    // Checks for a valid auth cookie via /auth/me; navigates to /auth if the request fails.
    useEffect(() => {
        const checkAuth = async () => {
            try {
                setAuthStatus("loading");
                const res = await api.get("/auth/me");
                setUser(res.data.user);
                setAuthStatus("success");
            } catch {
                setAuthStatus("failed");
                navigate("/auth");
            }
        };

        if (requiresAuth) {
            checkAuth();
        }
    }, [navigate, requiresAuth]);

    return { user, authStatus };
}
