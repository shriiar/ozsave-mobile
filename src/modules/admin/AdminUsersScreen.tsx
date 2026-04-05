import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
} from "react-native";
import Animated, {
  FadeInRight,
  FadeOutLeft,
  LinearTransition,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { GlassView } from "expo-glass-effect";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/src/context/ThemeContext";
import { useAuth } from "@/src/context/AuthContext";
import { useAdminUsers } from "./hooks/useAdminUsers";
import AdminSearchPanel from "./AdminSearchPanel";
import AdminInvitesPanel from "./AdminInvitesPanel";

type TabKey = "search" | "invites";

export default function AdminUsersScreen() {
  const { resolvedTheme } = useTheme();
  const { refreshUser, refreshing } = useAuth();
  const isDark = resolvedTheme === "dark";
  const insets = useSafeAreaInsets();

  const [tab, setTab] = useState<TabKey>("search");
  const shownErrorRef = useRef<string | null>(null);

  const {
    search,
    setSearch,
    searchResults,
    invitedUsers,
    searching,
    loadingInvites,
    error,
    clearError,
    invite,
    removeInvite,
    refresh,
    searchNow,
  } = useAdminUsers();

  const T = useMemo(() => {
    return {
      bg: isDark ? "#020617" : "#F8FAFC",
      border: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)",
      text: isDark ? "rgba(255,255,255,0.92)" : "#0F172A",
      muted: isDark ? "rgba(148,163,184,0.82)" : "#64748B",
      chipBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
      activeBg: isDark ? "rgba(79,70,229,0.22)" : "rgba(79,70,229,0.12)",
      activeText: "#4F46E5",
      spinner: isDark ? "rgba(255,255,255,0.92)" : "rgba(15,23,42,0.85)",
      androidBg: isDark ? "rgba(15,23,42,0.85)" : "rgba(255,255,255,0.95)",
    };
  }, [isDark]);

  useEffect(() => {
    if (!error) {
      shownErrorRef.current = null;
      return;
    }

    if (shownErrorRef.current === error) return;

    shownErrorRef.current = error;

    Toast.show({
      type: "error",
      text1: "Something went wrong",
      text2: error,
      position: "top",
      autoHide: false,
      onPress: () => {
        Toast.hide();
        clearError();
      },
    });
  }, [error, clearError]);

  async function onRefresh() {
    await refreshUser();
    await refresh();
  }

  const refreshingAll = refreshing || searching || loadingInvites;

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: T.bg,
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 76,
        },
      ]}
    >
      <GlassView
        glassEffectStyle="regular"
        colorScheme={isDark ? "dark" : "light"}
        style={[styles.headerCard, { borderColor: T.border }]}
      >
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: T.text }]}>User management</Text>
            <Text style={[styles.subtitle, { color: T.muted }]}>Search users and manage invitations to your house.</Text>
          </View>

          <View
            style={[
              styles.adminBadge,
              { borderColor: T.border, backgroundColor: T.chipBg },
            ]}
          >
            <Ionicons name="shield-checkmark-outline" size={14} color={T.text} />
            <Text style={[styles.adminBadgeText, { color: T.text }]}>Admin</Text>
          </View>
        </View>

        <View style={styles.tabRow}>
          <Pressable
            onPress={() => setTab("search")}
            style={[
              styles.tabBtn,
              {
                backgroundColor: tab === "search" ? T.activeBg : T.chipBg,
                borderColor: tab === "search" ? "rgba(79,70,229,0.25)" : T.border,
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: tab === "search" ? T.activeText : T.text },
              ]}
            >
              Search
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setTab("invites")}
            style={[
              styles.tabBtn,
              {
                backgroundColor: tab === "invites" ? T.activeBg : T.chipBg,
                borderColor: tab === "invites" ? "rgba(79,70,229,0.25)" : T.border,
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: tab === "invites" ? T.activeText : T.text },
              ]}
            >
              Invites
            </Text>
          </Pressable>
        </View>
      </GlassView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshingAll}
            onRefresh={onRefresh}
            tintColor={T.spinner}
            colors={[T.spinner]}
            progressBackgroundColor={T.androidBg}
          />
        }
      >
        <Animated.View
          key={tab}
          entering={FadeInRight.duration(180)}
          exiting={FadeOutLeft.duration(140)}
          layout={LinearTransition.duration(180)}
        >
          {tab === "search" ? (
            <AdminSearchPanel
              search={search}
              setSearch={setSearch}
              searchResults={searchResults}
              searching={searching}
              invite={invite}
              removeInvite={removeInvite}
              onSearch={searchNow}
            />
          ) : (
            <AdminInvitesPanel
              invitedUsers={invitedUsers}
              loadingInvites={loadingInvites}
              removeInvite={removeInvite}
            />
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 0,
  },
  headerCard: {
    marginHorizontal: 14,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    padding: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  title: { fontSize: 20, fontWeight: "800" },
  subtitle: { marginTop: 4, fontSize: 13, lineHeight: 18 },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  adminBadgeText: { fontSize: 12, fontWeight: "700" },
  tabRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  tabBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: { fontSize: 13, fontWeight: "800" },
  content: {
    flex: 1,
    marginTop: 12,
    paddingHorizontal: 14,
  },
  contentContainer: {
    paddingBottom: 12,
    flexGrow: 1,
  },
});