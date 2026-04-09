export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://lawprojectbackend-1.onrender.com/api";

export const SOCKET_BASE_URL =
  import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace(/\/api\/?$/, "");
