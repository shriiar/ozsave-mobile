// src/context/ThemeContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireThemeTransition } from "../lib/themeTransition";

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
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme() ?? "light"
  );
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    (Appearance.getColorScheme() ?? "light") === "dark" ? "dark" : "light"
  );

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
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setResolvedTheme(resolveTheme(theme, systemScheme));
  }, [theme, systemScheme, mounted]);

  // Force genuinely native UI (the NativeTabs bar, ActionSheetIOS, Alerts,
  // etc.) to follow our in-app theme choice. Without this, those components
  // read the OS-level appearance directly and ignore an explicit light/dark
  // pick made inside the app.
  useEffect(() => {
    if (!mounted) return;

    if (theme === "system") {
      Appearance.setColorScheme("unspecified");
      // Clearing the override doesn't itself fire a change event, so
      // re-read the true current value directly rather than waiting on one.
      setSystemScheme(Appearance.getColorScheme() ?? "light");
    } else {
      Appearance.setColorScheme(resolvedTheme);
    }
  }, [mounted, theme, resolvedTheme]);

  const setTheme = useCallback(
    (t: Theme) => {
      const nextResolved = resolveTheme(t, systemScheme);

      const apply = () => {
        setThemeState(t);
        AsyncStorage.setItem(STORAGE_KEY, t).catch(() => {});
      };

      // Only animate when the visible theme actually changes
      if (nextResolved !== resolvedTheme) {
        if (!fireThemeTransition({ apply })) {
          apply(); // overlay not mounted — apply immediately
        }
      } else {
        apply(); // no visual change (e.g. switching to "system" when system matches current)
      }
    },
    [resolvedTheme, systemScheme]
  );

  const toggle = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggle, mounted }),
    [theme, resolvedTheme, setTheme, toggle, mounted]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme must be used inside ThemeProvider");
  return v;
}
