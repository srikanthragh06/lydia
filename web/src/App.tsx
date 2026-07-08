import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthPage from "./pages/auth/AuthPage";
import NotFoundPage from "./pages/notFound/NotFoundPage";
import AuthCallbackPage from "./pages/authCallback/AuthCallbackPage";

// Root component: defines the client-side route table and renders the matched page.
function App() {
    const router = createBrowserRouter([
        {
            path: "/auth",
            element: <AuthPage />,
        },
        {
            path: "/auth/callback",
            element: <AuthCallbackPage />,
        },
        {
            path: "*",
            element: <NotFoundPage />,
        },
    ]);

    return (
        <div className="w-screen h-screen bg-black">
            <RouterProvider router={router} />
        </div>
    );
}

export default App;
