import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import type { Conversation, User } from "shared";
import { api } from "../../lib/axios";
import { selectedConversationIdAtom } from "./atoms";

// Buckets a conversation's updatedAt into a coarse recency group for the sidebar sections.
function getDateGroup(
    dateString: string,
): "Today" | "Yesterday" | "Previous 7 Days" | "Older" {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return "Previous 7 Days";
    return "Older";
}

const DATE_GROUPS = ["Today", "Yesterday", "Previous 7 Days", "Older"] as const;

// Left sidebar: lists the signed-in user's conversations grouped by recency, lets them start a
// new one, and shows their account info at the bottom.
const Sidebar = ({ user }: { user: User }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]); // this user's conversations, most recently updated first
    const [isLoadingConversations, setIsLoadingConversations] = useState(true); // true until the initial conversation list has loaded
    const [selectedConversationId, setSelectedConversationId] = useAtom(
        selectedConversationIdAtom,
    ); // conversation currently highlighted as active, shared with the chat window

    // Loads the signed-in user's conversations once, on mount.
    useEffect(() => {
        const loadConversations = async () => {
            try {
                const res = await api.get("/conversations");
                setConversations(res.data.conversations);
            } finally {
                setIsLoadingConversations(false);
            }
        };
        loadConversations();
    }, []);

    // Creates a new, untitled conversation and adds it to the top of the list as the active one.
    const handleNewChat = async () => {
        const res = await api.post("/conversations");
        const conversation: Conversation = res.data.conversation;
        setConversations((prev) => [conversation, ...prev]);
        setSelectedConversationId(conversation.id);
    };

    // Clears the auth cookie and sends the user back to the sign-in page.
    const handleLogout = async () => {
        await api.post("/auth/logout");
        window.location.assign("/auth");
    };

    return (
        <div className="w-64 h-full flex flex-col border-r border-white/10 text-white">
            {/* starts a new, untitled conversation and selects it */}
            <button
                onClick={handleNewChat}
                className="m-3 px-3 py-2 rounded-lg  
                hover:bg-white/10 transition text-left cursor-pointer"
            >
                New Chat +
            </button>

            {/* conversation list, split into recency sections (Today/Yesterday/...) */}
            <div className="flex-1 overflow-y-auto px-2 space-y-4 scrollbar-thin">
                {isLoadingConversations ? (
                    // skeleton rows shown while the initial list request is in flight
                    <div className="space-y-2 px-2">
                        {[...Array(6)].map((_, index) => (
                            <div
                                key={index}
                                className="h-8 rounded-lg bg-white/5 animate-pulse"
                            />
                        ))}
                    </div>
                ) : (
                    DATE_GROUPS.map((group) => {
                        // conversations belonging to this recency group
                        const groupConversations = conversations.filter(
                            (conversation) =>
                                getDateGroup(conversation.updatedAt) === group,
                        );
                        // skip rendering empty sections entirely
                        if (groupConversations.length === 0) return null;

                        return (
                            <div key={group}>
                                {/* section header, e.g. "Today" */}
                                <div className="px-2 text-xs text-white/50 mb-1">
                                    {group}
                                </div>
                                {/* one row per conversation in this section */}
                                {groupConversations.map((conversation) => (
                                    <button
                                        key={conversation.id}
                                        onClick={() =>
                                            setSelectedConversationId(
                                                conversation.id,
                                            )
                                        }
                                        className={`w-full text-left px-2 py-2 rounded-lg truncate transition cursor-pointer ${
                                            selectedConversationId ===
                                            conversation.id
                                                ? "bg-white/10"
                                                : "hover:bg-white/5 transition"
                                        }`}
                                    >
                                        {conversation.title ?? `New message`}
                                    </button>
                                ))}
                            </div>
                        );
                    })
                )}
            </div>

            {/* signed-in user's account info, pinned to the bottom */}
            <div className="flex items-center gap-2 p-3 border-t border-white/10">
                {user.picture && (
                    <img
                        referrerPolicy="no-referrer"
                        src={user.picture}
                        alt={user.name ?? user.emailId}
                        className="w-8 h-8 rounded-full"
                    />
                )}
                <div className="flex flex-col overflow-hidden flex-1">
                    <span className="text-sm truncate">{user.name}</span>
                    <span className="text-xs text-white/50 truncate">
                        {user.emailId}
                    </span>
                </div>

                {/* signs the user out and returns them to the sign-in page */}
                <button
                    onClick={handleLogout}
                    className="text-xs text-white/50 hover:text-white hover:bg-white/10 rounded-lg px-2 py-1 transition cursor-pointer"
                >
                    Log out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
