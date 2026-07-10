import Page from "../../components/Page";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import { useAuth } from "../../hooks/useAuth";

const ChatPage = () => {
    const { user } = useAuth(true); // signed-in user, passed down to the sidebar's account footer

    return (
        <Page requiresAuth={true}>
            <div className="flex w-full h-full">
                {/* left conversation sidebar, once the signed-in user is known */}
                {user && <Sidebar user={user} />}
                {/* main chat/message panel */}
                <ChatWindow />
            </div>
        </Page>
    );
};

export default ChatPage;
