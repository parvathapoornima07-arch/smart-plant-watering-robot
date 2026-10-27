import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/lib/env";
import { supabase } from "@/lib/supabase";
import type { ApiError } from "@/types";

/**
 * Typed HTTP client for the Express backend.
 *
 * - Base URL comes from VITE_API_BASE_URL (never a hardcoded localhost).
 * - The user's Supabase access token is attached automatically for the user's
 *   own session. The service-role key is NEVER used here — it is server-only.
 * - Errors are normalised into a consistent ApiError shape.
 */
const instance: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl || "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach the user's access token when present.
instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const { data } = await supabase?.auth.getSession() ?? { data: null };
  const token = data?.session?.access_token;
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// Normalise errors.
instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected network error occurred.";
    const normalised: ApiError = {
      message,
      code: error.response?.data?.code,
      details: error.response?.data?.details,
    };
    // 401 from a stale session: sign out silently so the UI reflects reality.
    if (status === 401) {
      void supabase?.auth.signOut().catch(() => undefined);
    }
    return Promise.reject(normalised);
  }
);

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await instance.get<T>(url, config);
  return res.data;
}

export async function apiPost<T, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await instance.post<T>(url, body, config);
  return res.data;
}

export async function apiPut<T, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await instance.put<T>(url, body, config);
  return res.data;
}

export async function apiPatch<T, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await instance.patch<T>(url, body, config);
  return res.data;
}

export { instance as axiosInstance };
