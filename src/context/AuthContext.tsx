// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { AuthApi } from "../modules/auth/api";
import type { User } from "../modules/auth/types";

type AuthContextType = {
  user: User | null;
  loading: boolean;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ prevents repeated /me calls
  const bootedRef = useRef(false);
  const fetchingMeRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function fetchUser() {
    if (fetchingMeRef.current) return; // ✅ lock
    fetchingMeRef.current = true;

    try {
      const me = await AuthApi.me();
      if (!mountedRef.current) return;
      setUser(me);
    } catch (err) {
      if (!mountedRef.current) return;
      setUser(null);
      await removeToken();
      setTokenState(null);
    } finally {
      fetchingMeRef.current = false;
      if (mountedRef.current) setLoading(false);
    }
  }

  useEffect(() => {
    // ✅ only bootstrap once per app run
    if (bootedRef.current) return;
    bootedRef.current = true;

    (async () => {
      try {
        const saved = await getToken();
        if (!mountedRef.current) return;

        if (!saved) {
          setLoading(false);
          return;
        }

        setTokenState(saved);
        await fetchUser();
      } catch {
        if (mountedRef.current) setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signup(name: string, email: string, password: string) {
    await AuthApi.signup({ name, email: email.trim().toLowerCase(), password });
  }

  async function login(email: string, password: string) {
    setLoading(true);
    const normalized = email.trim().toLowerCase();
    const res = await AuthApi.login({ email: normalized, password });

    const accessToken = res.data.accessToken;
    await setToken(accessToken);
    setTokenState(accessToken);

    await fetchUser();
  }

  async function loginWithToken(t: string) {
    setLoading(true);
    await setToken(t);
    setTokenState(t);
    await fetchUser();
  }

  async function logout() {
    await removeToken();
    setTokenState(null);
    setUser(null);
    setLoading(false);
  }

  async function refreshUser() {
    setLoading(true);
    await fetchUser();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
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