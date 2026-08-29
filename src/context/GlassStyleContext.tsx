// src/context/GlassStyleContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type GlassStyle = "clear" | "regular";

type GlassStyleCtx = {
  glassStyle: GlassStyle;
  setGlassStyle: (s: GlassStyle) => void;
  mounted: boolean;
};

const STORAGE_KEY = "glassStyle";
const Ctx = createContext<GlassStyleCtx | null>(null);

export function GlassStyleProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [glassStyle, setGlassStyleState] = useState<GlassStyle>("regular");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const saved = (await AsyncStorage.getItem(STORAGE_KEY)) as GlassStyle | null;
        if (!alive) return;
        if (saved === "clear" || saved === "regular") setGlassStyleState(saved);
      } catch {
        // ignore
      } finally {
        if (alive) setMounted(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setGlassStyle = useCallback((s: GlassStyle) => {
    setGlassStyleState(s);
    AsyncStorage.setItem(STORAGE_KEY, s).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ glassStyle, setGlassStyle, mounted }),
    [glassStyle, setGlassStyle, mounted]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGlassStyle() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useGlassStyle must be used inside GlassStyleProvider");
  return v;
}
