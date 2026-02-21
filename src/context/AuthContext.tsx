// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { AuthApi } from "../modules/auth/api";
import type { User } from "../modules/auth/types";

type AuthContextType = {
  user: User | null;

  /**
   * Backwards compatible:
   * `loading` = BOOTING only (initial load / login)
   * Do NOT toggle this during pull-to-refresh.
   */
  loading: boolean;

  /** pull-to-refresh / background refresh */
  refreshing: boolean;

  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  token: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "ozsave_access_token";

async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}
async function setToken(token: string) {
  return SecureStore.setItemAsync(TOKEN_KEY, token);
}
async function removeToken() {
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}

/**
 * Extract a status code from different error shapes:
 * - fetch wrappers might throw { status, data }
 * - axios throws { response: { status, data } }
 */
function getStatus(err: any) {
  return err?.response?.status ?? err?.status ?? null;
}

function getMessage(err: any) {
  const d = err?.response?.data ?? err?.data ?? null;
  const msg =
    (typeof d === "object" && (d?.message || d?.error)) ||
    (typeof err?.message === "string" && err.message) ||
    "";
  return String(msg);
}

/**
 * Auth-invalid conditions:
 * - 401/403 = token invalid / expired
 * - 404 User not found (your new DB case)
 */
function isAuthInvalid(err: any) {
  const status = getStatus(err);
  if (status === 401 || status === 403) return true;

  if (status === 404) {
    const msg = getMessage(err).toLowerCase();
    // backend returns "User not found"
    if (msg.includes("user not found")) return true;
  }

  return false;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  // boot loading (initial app start / login only)
  const [booting, setBooting] = useState(true);

  // refresh loading (pull-to-refresh etc)
  const [refreshing, setRefreshing] = useState(false);

  // prevents repeated /me calls
  const bootedRef = useRef(false);
  const fetchingMeRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function hardLogout() {
    // single place to fully clear auth
    await removeToken();
    if (!mountedRef.current) return;
    setTokenState(null);
    setUser(null);
  }

  async function fetchUser(opts?: { onAuthFail?: "logout" | "keep" }) {
    if (fetchingMeRef.current) return; // lock
    fetchingMeRef.current = true;

    try {
      const me = await AuthApi.me();
      if (!mountedRef.current) return;
      setUser(me);
    } catch (err: any) {
      if (!mountedRef.current) return;

      // ✅ logout only when auth is truly invalid AND caller wants logout
      if (opts?.onAuthFail === "logout" && isAuthInvalid(err)) {
        await hardLogout();
      }

      // Otherwise keep current user (network hiccup, 500, etc)
    } finally {
      fetchingMeRef.current = false;
    }
  }

  // bootstrap once
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    (async () => {
      try {
        const saved = await getToken();
        if (!mountedRef.current) return;

        if (!saved) {
          setBooting(false);
          return;
        }

        setTokenState(saved);
        await fetchUser({ onAuthFail: "logout" });
      } finally {
        if (mountedRef.current) setBooting(false);
      }
    })();
  }, []);

  async function signup(name: string, email: string, password: string) {
    await AuthApi.signup({ name, email: email.trim().toLowerCase(), password });
  }

  async function login(email: string, password: string) {
    setBooting(true);
    try {
      const normalized = email.trim().toLowerCase();
      const res = await AuthApi.login({ email: normalized, password });

      const accessToken = res.data.accessToken;
      await setToken(accessToken);
      if (!mountedRef.current) return;
      setTokenState(accessToken);

      await fetchUser({ onAuthFail: "logout" });
    } finally {
      if (mountedRef.current) setBooting(false);
    }
  }

  async function loginWithToken(t: string) {
    setBooting(true);
    try {
      await setToken(t);
      if (!mountedRef.current) return;
      setTokenState(t);

      await fetchUser({ onAuthFail: "logout" });
    } finally {
      if (mountedRef.current) setBooting(false);
    }
  }

  async function logout() {
    await hardLogout();
    if (!mountedRef.current) return;
    setBooting(false);
    setRefreshing(false);
  }

  /**
   * Pull-to-refresh safe:
   * - DO NOT toggle booting/loading
   * - DO NOT logout on random errors
   *
   * But if token is truly invalid (401/403) OR "User not found" (404),
   * you still SHOULD logout — otherwise you'll loop forever.
   */
  async function refreshUser() {
    setRefreshing(true);
    try {
      // ✅ allow logout here too if it's truly invalid
      await fetchUser({ onAuthFail: "logout" });
    } finally {
      if (mountedRef.current) setRefreshing(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading: booting,
        refreshing,
        signup,
        login,
        loginWithToken,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}