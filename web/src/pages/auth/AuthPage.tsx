import { FcGoogle } from "react-icons/fc";

const AuthPage = () => {
    return (
        <div
            className="w-full h-full text-white 
        flex flex-col items-center justify-center"
        >
            <div className=" flex flex-col items-center space-y-4">
                <div>Please sign in to continue</div>
                <button
                    className="flex gap-2 items-center text-xl 
                bg-white px-3 py-2 text-black rounded-lg
                cursor-pointer hover:opacity-90 transition"
                >
                    <FcGoogle />
                    Sign in with Google
                </button>
            </div>
        </div>
    );
};

export default AuthPage;
