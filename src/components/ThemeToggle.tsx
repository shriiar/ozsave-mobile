// src/components/ThemeToggle.tsx
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme, toggle, mounted } = useTheme();

  // keep stable until loaded from storage
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  const seg = (t: Theme) => {
    const active = theme === t;
    return (
      <Pressable
        key={t}
        onPress={() => setTheme(t)}
        style={[styles.segBtn, active && styles.segBtnActive]}
      >
        <Text style={[styles.segText, isDark && styles.segTextDark, active && styles.segTextActive]}>
          {t === "system" ? "System" : t === "light" ? "Light" : "Dark"}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.root}>
      {/* glass base */}
      <BlurView intensity={28} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={
          isDark
            ? ["rgba(15,23,42,0.55)", "rgba(15,23,42,0.35)", "rgba(15,23,42,0.22)"]
            : ["rgba(255,255,255,0.60)", "rgba(255,255,255,0.45)", "rgba(255,255,255,0.30)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={
          isDark
            ? ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.00)"]
            : ["rgba(255,255,255,0.55)", "rgba(255,255,255,0.00)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[StyleSheet.absoluteFill, { opacity: isDark ? 0.12 : 0.22 }]}
      />

      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={[styles.title, isDark && styles.titleDark]}>Theme</Text>
          <Text style={[styles.sub, isDark && styles.subDark]}>
            {theme === "system" ? `System (${resolvedTheme})` : resolvedTheme}
          </Text>
        </View>

        <Pressable onPress={toggle} style={[styles.quickBtn, isDark && styles.quickBtnDark]}>
          <Ionicons
            name={resolvedTheme === "dark" ? "sunny-outline" : "moon-outline"}
            size={16}
            color={isDark ? "rgba(255,255,255,0.92)" : "#111827"}
          />
        </Pressable>
      </View>

      <View style={[styles.segment, isDark && styles.segmentDark]}>
        {(["system", "light", "dark"] as Theme[]).map(seg)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: 16,
    overflow: "hidden",
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.65)",
  },

  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  left: { flex: 1 },
  title: { fontSize: 13, fontWeight: "800", color: "#111827" },
  titleDark: { color: "rgba(255,255,255,0.92)" },
  sub: { marginTop: 2, fontSize: 11, color: "#6B7280" },
  subDark: { color: "rgba(148,163,184,0.95)" },

  quickBtn: {
    height: 34,
    width: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.06)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.08)",
  },
  quickBtnDark: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.10)",
  },

  segment: {
    marginTop: 10,
    flexDirection: "row",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.08)",
  },
  segmentDark: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.10)",
  },

  segBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segBtnActive: {
    backgroundColor: "rgba(79,70,229,0.14)",
  },
  segText: { fontSize: 12, fontWeight: "800", color: "#111827" },
  segTextDark: { color: "rgba(255,255,255,0.88)" },
  segTextActive: { color: "#4F46E5" },
});