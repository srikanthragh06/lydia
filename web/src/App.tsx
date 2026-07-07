import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthPage from "./pages/auth/AuthPage";
import NotFoundPage from "./pages/notFound/NotFoundPage";

function App() {
    const router = createBrowserRouter([
        {
            path: "/auth",
            element: <AuthPage />,
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
