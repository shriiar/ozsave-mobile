import React from "react";
import { Switch, Platform } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useGlassStyle } from "../context/GlassStyleContext";

export function GlassStyleToggle() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { glassStyle, setGlassStyle, mounted } = useGlassStyle();

  if (!mounted) return null;

  return (
    <Switch
      value={glassStyle === "regular"}
      onValueChange={(v) => setGlassStyle(v ? "regular" : "clear")}
      trackColor={Platform.OS === "ios" ? undefined : { false: "#767577", true: "#4F46E5" }}
      ios_backgroundColor={isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.12)"}
    />
  );
}
