import axios from "axios";
import { API_BASE_URL } from "./apiConfig.js";

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

const AUTH_STORAGE_KEY = "token";
const USER_STORAGE_KEY = "user";

const readStoredUser = () => {
  try {
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

const saveSession = (token, user) => {
  if (token) {
    localStorage.setItem(AUTH_STORAGE_KEY, token);
  }

  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  window.dispatchEvent(new CustomEvent("auth:changed", { detail: user || null }));
};

const clearSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};

export const getRedirectPathByRole = (role) => {
  if (role === "lawyer") {
    return "/lawyer-dashboard";
  }

  if (role === "admin") {
    return "/admin";
  }

  return "/client-dashboard";
};

API.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_STORAGE_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";
    const isAuthRequest = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

    if (error.response?.status === 401 && !isAuthRequest) {
      const currentToken = localStorage.getItem(AUTH_STORAGE_KEY);

      if (currentToken) {
        clearSession();
        window.dispatchEvent(new CustomEvent("auth:session-expired"));
        window.dispatchEvent(new CustomEvent("auth:logout"));
        window.dispatchEvent(new CustomEvent("auth:changed", { detail: null }));
      }
    }

    return Promise.reject(error);
  }
);

export const register = async (formData) => {
  const response = await API.post("/auth/register", formData);
  saveSession(response.data?.token, response.data?.user);
  return response.data;
};

export const login = async (formData) => {
  const response = await API.post("/auth/login", formData);
  saveSession(response.data?.token, response.data?.user);
  return response.data;
};

export const logout = () => {
  clearSession();
  window.dispatchEvent(new CustomEvent("auth:logout"));
  window.dispatchEvent(new CustomEvent("auth:changed", { detail: null }));
};

export const getToken = () => localStorage.getItem(AUTH_STORAGE_KEY);

export const getCurrentUser = () => readStoredUser();

export const getProfile = async () => {
  const response = await API.get("/auth/profile");
  const user = response.data?.user || response.data;
  saveSession(getToken(), user);
  return response.data;
};

export const isAuthenticated = () => Boolean(getToken());

export default API;
