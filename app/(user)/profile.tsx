// app/(user)/profile.tsx
//
// Basic/functional for now — houses what used to live in DashboardShell's
// expandable menu sheet (theme toggle, user info, logout, admin link).
// Will get a proper design pass later.
import React from "react";
import { View, Text, Image, Pressable, StyleSheet, ScrollView, ActionSheetIOS, Alert, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GlassView } from "expo-glass-effect";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";
import { useGlassStyle } from "../../src/context/GlassStyleContext";
import { ThemeToggle } from "../../src/components/ThemeToggle";
import { GlassStyleToggle } from "../../src/components/GlassStyleToggle";
import { typography } from "../../src/theme/typography";
import { useScrollToTop } from "../../src/hooks/useScrollToTop";
import { useRemountOnThemeRefocus } from "../../src/hooks/useRemountOnThemeRefocus";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const { glassStyle } = useGlassStyle();
  const isDark = resolvedTheme === "dark";
  const insets = useSafeAreaInsets();

  const isAdmin = user?.role === "admin";
  const scrollRef = useScrollToTop<ScrollView>("/profile");
  const remountKey = useRemountOnThemeRefocus();

  const T = {
    bg: isDark ? "#0a0a0a" : "#F5F7FB",
    text: isDark ? "rgba(255,255,255,0.92)" : "#0F172A",
    muted: isDark ? "rgba(148,163,184,0.95)" : "#475569",
    cardBg: isDark ? "rgba(22,22,22,0.70)" : "rgba(0,0,0,0.04)",
    ring: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
    dangerText: isDark ? "rgba(254,202,202,0.95)" : "#B91C1C",
    dangerBg: "rgba(239,68,68,0.10)",
  };

  async function performLogout() {
    try {
      await logout();
    } finally {
      router.replace("/(auth)/login" as any);
    }
  }

  function handleLogout() {
    const title = "Log out";
    const message = "Are you sure you want to log out?";

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title,
          message,
          options: ["Log out", "Cancel"],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) performLogout();
        }
      );
    } else {
      Alert.alert(title, message, [
        { text: "Cancel", style: "cancel" },
        { text: "Log out", style: "destructive", onPress: () => performLogout() },
      ]);
    }
  }

  if (!user) return null;

  return (
    <ScrollView
      key={remountKey}
      ref={scrollRef}
      style={{ flex: 1, backgroundColor: T.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24, gap: 16 }}
    >
      <Text style={[typography.title2, { color: T.text }]}>Profile</Text>

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
          <Text style={[typography.subheadlineEmphasized, { color: T.text }]} numberOfLines={1}>
            {user.name}
          </Text>
          <Text style={[typography.caption1, styles.email, { color: T.muted }]} numberOfLines={1}>
            {user.email}
          </Text>
          {user.house?.name ? (
            <Text style={[typography.caption1, styles.house, { color: T.muted }]} numberOfLines={1}>
              {user.house.name}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: T.cardBg, borderColor: T.ring, flexDirection: "column", alignItems: "stretch", gap: 14 }]}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={[typography.subheadlineEmphasized, styles.rowLabel, { color: T.text }]}>Theme</Text>
          <ThemeToggle />
        </View>

        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: T.ring }} />

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={[typography.subheadlineEmphasized, styles.rowLabel, { color: T.text }]}>Glass style</Text>
          <GlassStyleToggle />
        </View>
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
          <Text style={[typography.subheadlineEmphasized, styles.rowLabel, { color: T.text, flex: 1 }]}>Users & Invites</Text>
          <Ionicons name="chevron-forward" size={18} color={T.muted} />
        </Pressable>
      ) : null}

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
      >
        <GlassView
          glassEffectStyle={glassStyle}
          isInteractive
          tintColor={T.dangerBg}
          colorScheme={isDark ? "dark" : "light"}
          style={[
            styles.card,
            { borderColor: "rgba(239,68,68,0.25)", flexDirection: "row", alignItems: "center", gap: 12 },
          ]}
        >
          <Ionicons name="log-out-outline" size={20} color={T.dangerText} />
          <Text style={[typography.subheadlineEmphasized, styles.rowLabel, { color: T.dangerText }]}>Log out</Text>
        </GlassView>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  email: { marginTop: 2 },
  house: { marginTop: 2 },
  rowLabel: {},
});
