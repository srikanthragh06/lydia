import { useEffect, useState } from "react";
import type { Conversation, User } from "shared";
import { api } from "../../lib/axios";

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
    const [selectedConversationId, setSelectedConversationId] = useState<
        number | null
    >(null); // conversation currently highlighted as active

    // Loads the signed-in user's conversations once, on mount.
    useEffect(() => {
        const loadConversations = async () => {
            const res = await api.get("/conversations");
            setConversations(res.data.conversations);
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
            <div className="flex-1 overflow-y-auto px-2 space-y-4">
                {DATE_GROUPS.map((group) => {
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
                                    {conversation.title ??
                                        `Conversation #${conversation.id}`}
                                </button>
                            ))}
                        </div>
                    );
                })}
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
                <div className="flex flex-col overflow-hidden">
                    <span className="text-sm truncate">{user.name}</span>
                    <span className="text-xs text-white/50 truncate">
                        {user.emailId}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
