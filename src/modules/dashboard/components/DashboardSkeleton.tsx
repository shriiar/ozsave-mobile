// src/modules/dashboard/components/DashboardSkeleton.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../../context/ThemeContext";

export default function DashboardSkeleton() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#0a0a0a" : "#F6F7FB" }]}>
      <View style={[styles.block, { height: 22, width: 160 }]} />
      <View style={[styles.block, { height: 14, width: 240, marginTop: 10 }]} />

      <View style={[styles.card, { marginTop: 20 }]} />
      <View style={[styles.card, { marginTop: 12 }]} />
      <View style={[styles.card, { marginTop: 12 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 28 },
  block: { borderRadius: 10, backgroundColor: "rgba(0,0,0,0.08)" },
  card: {
    height: 110,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
});