// app/(user)/profile.tsx
//
// Basic/functional for now — houses what used to live in DashboardShell's
// expandable menu sheet (theme toggle, user info, logout, admin link).
// Will get a proper design pass later.
import React from "react";
import { View, Text, Image, Pressable, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";
import { ThemeToggle } from "../../src/components/ThemeToggle";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const insets = useSafeAreaInsets();

  const isAdmin = user?.role === "admin";

  const T = {
    bg: isDark ? "#0a0a0a" : "#F5F7FB",
    text: isDark ? "rgba(255,255,255,0.92)" : "#0F172A",
    muted: isDark ? "rgba(148,163,184,0.95)" : "#475569",
    cardBg: isDark ? "rgba(22,22,22,0.70)" : "rgba(0,0,0,0.04)",
    ring: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
    dangerText: isDark ? "rgba(254,202,202,0.95)" : "#B91C1C",
    dangerBg: "rgba(239,68,68,0.10)",
  };

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.replace("/(auth)/login" as any);
    }
  }

  if (!user) return null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: T.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24, gap: 16 }}
    >
      <Text style={[styles.title, { color: T.text }]}>Profile</Text>

      <View style={[styles.card, { backgroundColor: T.cardBg, borderColor: T.ring }]}>
        {user.imageUrl ? (
          <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: T.ring }]}>
            <Text style={[styles.avatarInitial, { color: T.text }]}>
              {user.name?.charAt(0).toUpperCase() ?? "?"}
            </Text>
          </View>
        )}

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.name, { color: T.text }]} numberOfLines={1}>
            {user.name}
          </Text>
          <Text style={[styles.email, { color: T.muted }]} numberOfLines={1}>
            {user.email}
          </Text>
          {user.house?.name ? (
            <Text style={[styles.house, { color: T.muted }]} numberOfLines={1}>
              {user.house.name}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: T.cardBg, borderColor: T.ring, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}>
        <Text style={[styles.rowLabel, { color: T.text }]}>Appearance</Text>
        <ThemeToggle />
      </View>

      {isAdmin ? (
        <Pressable
          onPress={() => router.push("/admin/users" as any)}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: T.cardBg, borderColor: T.ring, flexDirection: "row", alignItems: "center", gap: 12, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Ionicons name="people-outline" size={20} color={T.text} />
          <Text style={[styles.rowLabel, { color: T.text, flex: 1 }]}>Users & Invites</Text>
          <Ionicons name="chevron-forward" size={18} color={T.muted} />
        </Pressable>
      ) : null}

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: T.dangerBg, borderColor: "rgba(239,68,68,0.25)", flexDirection: "row", alignItems: "center", gap: 12, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Ionicons name="log-out-outline" size={20} color={T.dangerText} />
        <Text style={[styles.rowLabel, { color: T.dangerText }]}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "800" },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: { height: 48, width: 48, borderRadius: 24 },
  avatarFallback: { height: 48, width: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontSize: 18, fontWeight: "800" },
  name: { fontSize: 15, fontWeight: "700" },
  email: { marginTop: 2, fontSize: 12.5, fontWeight: "500" },
  house: { marginTop: 2, fontSize: 12, fontWeight: "500" },
  rowLabel: { fontSize: 14, fontWeight: "700" },
});
