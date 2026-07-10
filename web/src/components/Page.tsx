import React from "react";
import { useAuth } from "../hooks/useAuth";

// Shared page shell: applies the common full-height layout, and when requiresAuth is true,
// gates children behind useAuth's session check (showing a loading message until it resolves).
const Page = ({
    className = "",
    children,
    requiresAuth,
}: {
    className?: string;
    children: React.ReactNode;
    requiresAuth: boolean;
}) => {
    const { authStatus } = useAuth(requiresAuth);

    // only render children once we know the user doesn't need checking, or the check succeeded;
    // "failed" still shows the loading text until the redirect to /auth takes effect
    const isReady =
        authStatus === "noAuthRequired" || authStatus === "success";

    if (!isReady) {
        return (
            <div className="w-full h-full text-white flex items-center justify-center">
                Authenticating...
            </div>
        );
    }

    return (
        <div
            className={`w-full h-full text-white
        flex flex-col ${className}`}
        >
            {children}
        </div>
    );
};

export default Page;
