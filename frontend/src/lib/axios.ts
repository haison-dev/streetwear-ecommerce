import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";

const defaultApiUrl = import.meta.env.DEV
  ? "http://localhost:5000/api"
  : "https://streetwear-ecommerce.onrender.com/api";

const apiBaseUrl = String(import.meta.env.VITE_API_URL || defaultApiUrl).replace(
  /\/+$/,
  "",
);

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
