// src/context/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "light" | "dark" | "system";

type ThemeCtx = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
  toggle: () => void;
  mounted: boolean;
};

const STORAGE_KEY = "theme";
const Ctx = createContext<ThemeCtx | null>(null);

function resolveTheme(theme: Theme, systemScheme: ColorSchemeName): "light" | "dark" {
  if (theme === "light") return "light";
  if (theme === "dark") return "dark";
  return systemScheme === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<Theme>("system");
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // init from storage
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const saved = (await AsyncStorage.getItem(STORAGE_KEY)) as Theme | null;
        if (!alive) return;
        setThemeState(saved ?? "system");
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

  // listen to OS theme changes (only matters if theme === "system")
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => sub.remove();
  }, []);

  // resolve whenever theme or system changes (after mounted)
  useEffect(() => {
    if (!mounted) return;
    const r = resolveTheme(theme, systemScheme);
    setResolvedTheme(r);
  }, [theme, systemScheme, mounted]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    AsyncStorage.setItem(STORAGE_KEY, t).catch(() => {});
  };

  const toggle = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggle, mounted }),
    [theme, resolvedTheme, mounted]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme must be used inside ThemeProvider");
  return v;
}