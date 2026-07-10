import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { createParser } from "eventsource-parser";
import type { ChatMessage } from "shared";
import { selectedConversationIdAtom } from "./atoms";

// Main chat panel: shows the selected conversation's messages and lets the user send a new
// prompt, streaming the assistant's reply in as it arrives.
const ChatWindow = () => {
    const conversationId = useAtomValue(selectedConversationIdAtom); // conversation currently open, set by the sidebar

    const [messages, setMessages] = useState<ChatMessage[]>([]); // messages shown so far this session (no history endpoint yet, so this resets on conversation change/reload)
    const [prompt, setPrompt] = useState(""); // current textarea input
    const [isStreaming, setIsStreaming] = useState(false); // true while the assistant's reply is still streaming in

    // Clears the visible messages whenever the selected conversation changes.
    useEffect(() => {
        setMessages([]);
    }, [conversationId]);

    // Sends the current prompt to the selected conversation and streams the assistant's reply
    // in, chunk by chunk, appending each piece onto a placeholder assistant message as it arrives.
    const handleSend = async () => {
        if (!conversationId || !prompt.trim() || isStreaming) return;

        const userPrompt = prompt;
        setPrompt("");
        setIsStreaming(true);
        setMessages((prev) => [
            ...prev,
            { role: "user", content: userPrompt },
            { role: "assistant", content: "" },
        ]);

        try {
            const res = await fetch(
                `${import.meta.env.VITE_SERVER_URL}/conversations/${conversationId}/messages`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ prompt: userPrompt }),
                },
            );

            // a non-2xx here means the request failed before any streaming could start (e.g.
            // an expired session or a validation error), so there are no SSE frames to parse
            if (!res.ok) {
                setMessages((prev) => {
                    const next = [...prev];
                    next[next.length - 1] = {
                        ...next[next.length - 1],
                        content: "Something went wrong.",
                    };
                    return next;
                });
                return;
            }

            // parses raw SSE bytes into clean { event, data } messages as they arrive, so we
            // don't have to hand-roll the frame-buffering/line-parsing ourselves
            const parser = createParser({
                onEvent(event) {
                    if (event.event === "error") {
                        // the model call failed after the stream had already started (so the
                        // server couldn't fall back to an HTTP error status) — show a failure
                        // message in place of whatever had streamed in so far
                        setMessages((prev) => {
                            const next = [...prev];
                            next[next.length - 1] = {
                                ...next[next.length - 1],
                                content: "Something went wrong.",
                            };
                            return next;
                        });
                        return;
                    } else if (event.event === "chunk") {
                        // append this chunk onto the last (assistant) message being streamed
                        setMessages((prev) => {
                            const next = [...prev];
                            next[next.length - 1] = {
                                ...next[next.length - 1],
                                content:
                                    next[next.length - 1].content + event.data,
                            };
                            return next;
                        });
                    }
                },
            });

            const reader = res.body!.getReader();
            const decoder = new TextDecoder();

            // reads the response body as it streams in, feeding each piece to the parser
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                parser.feed(decoder.decode(value, { stream: true }));
            }
        } finally {
            setIsStreaming(false);
        }
    };

    // no conversation selected yet: prompt the user to pick or start one instead of an empty panel
    if (!conversationId) {
        return (
            <div className="flex-1 flex items-center justify-center text-white/50">
                Select or start a conversation to begin.
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full text-white">
            {/* message list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`max-w-2xl ${
                            message.role === "user" ? "ml-auto" : "mr-auto"
                        }`}
                    >
                        <div
                            className={`px-4 py-2 rounded-2xl whitespace-pre-wrap ${
                                message.role === "user"
                                    ? "bg-white/10"
                                    : "bg-transparent"
                            }`}
                        >
                            {message.content}
                        </div>
                    </div>
                ))}
            </div>

            {/* prompt input */}
            <div className="p-4 border-t border-white/10 flex gap-2">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder="Send a message..."
                    className="flex-1 resize-none rounded-lg bg-white/5 px-3 py-2 outline-none"
                    rows={1}
                />
                <button
                    onClick={handleSend}
                    disabled={isStreaming || !prompt.trim()}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition disabled:opacity-50 cursor-pointer"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
