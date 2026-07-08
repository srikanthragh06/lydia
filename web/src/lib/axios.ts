import axios from "axios";

// Shared axios client for all requests to the backend; sends cookies with every
// request so the httpOnly auth cookie is included automatically.
export const api = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL,
    withCredentials: true,
});
