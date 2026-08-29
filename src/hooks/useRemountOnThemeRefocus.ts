import { useEffect, useRef, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";

// NativeTabs keeps every tab screen mounted at once, so a theme switch
// updates every screen's GlassView `colorScheme`/`tintColor` props
// simultaneously — including tabs that aren't currently visible. On iOS
// 26.1+ that background prop update doesn't take: the native Liquid Glass
// effect renders broken/flat until the view is torn down and recreated.
// Returning to the tab isn't enough by itself (the existing native view is
// still the stale one) — only a fresh mount fixes it.
//
// This hook bumps a key exactly once, the first time a screen regains focus
// after a theme change happened while it was in the background. Spread that
// key onto the screen's outermost View so React tears down and rebuilds the
// whole GlassView subtree with the current theme baked in from creation.
export function useRemountOnThemeRefocus(): number {
  const { resolvedTheme } = useTheme();
  const isFocused = useIsFocused();
  const [remountKey, setRemountKey] = useState(0);

  const themeAtLastFocus = useRef(resolvedTheme);
  const wasFocused = useRef(isFocused);

  useEffect(() => {
    if (isFocused) {
      if (!wasFocused.current && themeAtLastFocus.current !== resolvedTheme) {
        setRemountKey((k) => k + 1);
      }
      themeAtLastFocus.current = resolvedTheme;
    }
    wasFocused.current = isFocused;
  }, [isFocused, resolvedTheme]);

  return remountKey;
}
