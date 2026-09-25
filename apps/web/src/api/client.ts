import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const baseURL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "/api";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 120_000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const message = err.response?.data?.message ?? err.message ?? "Request failed";
    const error = new Error(typeof message === "string" ? message : JSON.stringify(message));
    (error as any).response = err.response;
    return Promise.reject(error);
  },
);
