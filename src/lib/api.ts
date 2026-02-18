// src/lib/api.ts
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "ozsave_access_token";
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL; // set this in .env

if (!BASE_URL) {
  console.warn("Missing EXPO_PUBLIC_API_BASE_URL in env");
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest<T>(
  method: Method,
  path: string,
  body?: any
): Promise<T> {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      json?.message ||
      json?.error ||
      `Request failed (${res.status})`;
    const err: any = new Error(typeof msg === "string" ? msg : "Request failed");
    err.response = { data: json, status: res.status };
    throw err;
  }

  return json as T;
}