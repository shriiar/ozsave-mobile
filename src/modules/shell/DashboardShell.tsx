// src/modules/shell/DashboardShell.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { router, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { ThemeToggle } from "../../components/ThemeToggle";

type NavItem = {
  name: string;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const ROUTES = {
  home: "/dashboard",
  cost: "/cost",
  billing: "/billing",
  income: "/income",
  adminUsers: "/admin/users",
  login: "/(auth)/login",
} as const;

const DRAWER_W = 280;
const TOPBAR_H = 52; // visual height of the card contents (not including margins)

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const insets = useSafeAreaInsets();

  const hasHouse = !!user?.house;
  const isAdmin = user?.role === "admin";

  const [open, setOpen] = useState(false);
  const slideX = useRef(new Animated.Value(DRAWER_W)).current;

  const lastRedirectRef = useRef<string | null>(null);

  function closeDrawer() {
    Animated.timing(slideX, {
      toValue: DRAWER_W,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setOpen(false));
  }

  function openDrawer() {
    setOpen(true);
    Animated.timing(slideX, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }

  useEffect(() => {
    if (open) closeDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ===== Guards (keep logic same) =====
  useEffect(() => {
    if (loading) return;
    if (!pathname) return;

    const redirect = (to: string) => {
      if (pathname === to) return;
      if (lastRedirectRef.current === to) return;
      lastRedirectRef.current = to;

      requestAnimationFrame(() => {
        router.replace(to as any);
      });
    };

    if (!user) {
      redirect(ROUTES.login);
      return;
    }

    if (!hasHouse && pathname !== ROUTES.home) {
      redirect(ROUTES.home);
      return;
    }

    if (!isAdmin && pathname.startsWith("/admin")) {
      redirect(ROUTES.home);
      return;
    }

    lastRedirectRef.current = null;
  }, [loading, user, hasHouse, isAdmin, pathname]);

  const navItems: NavItem[] = useMemo(() => {
    if (!hasHouse) return [{ name: "Home", href: ROUTES.home, icon: "home-outline" }];
    return [
      { name: "Home", href: ROUTES.home, icon: "home-outline" },
      { name: "Costs", href: ROUTES.cost, icon: "receipt-outline" },
      { name: "Billing", href: ROUTES.billing, icon: "card-outline" },
      { name: "Income", href: ROUTES.income, icon: "wallet-outline" },
    ];
  }, [hasHouse]);

  const adminItems: NavItem[] = useMemo(() => {
    if (!hasHouse || !isAdmin) return [];
    return [{ name: "Users & Invites", href: ROUTES.adminUsers, icon: "people-outline" }];
  }, [hasHouse, isAdmin]);

  function isActive(href: string) {
    return pathname === href || (href !== ROUTES.home && pathname.startsWith(href));
  }

  function onNavPress(href: string) {
    if (isActive(href)) {
      closeDrawer();
      return;
    }
    closeDrawer();
    router.push(href as any);
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.replace(ROUTES.login as any);
    }
  }

  // ===== TOKENS (NO BLUE ACCENT, NO GLOWS) =====
  const TOKENS = useMemo(() => {
    const shellBg = isDark ? "#020617" : "#F5F7FB";

    const glassGrad = isDark
      ? ["rgba(15,23,42,0.25)", "rgba(15,23,42,0.18)", "rgba(15,23,42,0.12)"]
      : ["rgba(255,255,255,0.22)", "rgba(255,255,255,0.16)", "rgba(255,255,255,0.10)"];

    const glassRefraction = isDark
      ? ["rgba(255,255,255,0.10)", "rgba(255,255,255,0.00)"]
      : ["rgba(255,255,255,0.60)", "rgba(255,255,255,0.00)"];

    const ring = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";

    const shadowHeavy = isDark
      ? {
        shadowColor: "#000",
        shadowOpacity: 0.65,
        shadowRadius: 40,
        shadowOffset: { width: 0, height: 20 },
        elevation: 18,
      }
      : {
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 8,
      };

    const shadowMedium = isDark
      ? {
        shadowColor: "#000",
        shadowOpacity: 0.55,
        shadowRadius: 30,
        shadowOffset: { width: 0, height: 16 },
        elevation: 12,
      }
      : {
        shadowColor: "#000",
        shadowOpacity: 0.10,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 10,
      };

    const textPrimary = isDark ? "rgba(255,255,255,0.92)" : "#0F172A";
    const textMuted = isDark ? "rgba(148,163,184,0.95)" : "#475569";

    const btnBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
    const btnBgHover = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";

    const itemIdleText = isDark ? "rgba(226,232,240,0.92)" : "#334155";
    const itemPressedBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

    // Active state: neutral, no blue
    const activeBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.70)";
    const activeRing = isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.10)";
    const activeText = textPrimary;

    const iconIdleBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
    const iconIdle = isDark ? "rgba(226,232,240,0.92)" : "#334155";

    const iconActiveBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
    const iconActive = textPrimary;

    const divider = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";

    const userCardBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.70)";
    const userCardBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";

    const themeCardGrad = isDark
      ? ["rgba(15,23,42,0.80)", "rgba(15,23,42,0.60)", "rgba(15,23,42,0.40)"]
      : ["rgba(255,255,255,0.90)", "rgba(255,255,255,0.70)", "rgba(255,255,255,0.50)"];

    const themeCardBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";

    const logoutBg = "rgba(239,68,68,0.10)";
    const logoutBorder = "rgba(239,68,68,0.25)";
    const logoutText = isDark ? "rgba(254,202,202,0.95)" : "#B91C1C";
    const logoutIconBg = "rgba(239,68,68,0.12)";

    return {
      shellBg,

      glassGrad,
      glassRefraction,
      ring,

      shadowHeavy,
      shadowMedium,

      textPrimary,
      textMuted,

      btnBg,
      btnBgHover,

      itemIdleText,
      itemPressedBg,

      activeBg,
      activeRing,
      activeText,

      iconIdleBg,
      iconIdle,
      iconActiveBg,
      iconActive,

      divider,
      userCardBg,
      userCardBorder,

      themeCardGrad,
      themeCardBorder,

      logoutBg,
      logoutBorder,
      logoutText,
      logoutIconBg,
    };
  }, [isDark]);

  if (loading) {
    return (
      <View style={[styles.screen, { backgroundColor: TOKENS.shellBg, justifyContent: "center", alignItems: "center" }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Text style={{ opacity: 0.7, color: TOKENS.textMuted }}>Loading dashboard...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.screen, { backgroundColor: TOKENS.shellBg, justifyContent: "center", alignItems: "center" }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Text style={{ opacity: 0.7, color: TOKENS.textMuted }}>Redirecting...</Text>
      </View>
    );
  }

  const BOTTOM_BAR_SPACE = TOPBAR_H + 12 + insets.bottom;

  return (
    <View style={[styles.screen, { backgroundColor: TOKENS.shellBg }]}>
      <StatusBar style={isDark ? "light" : "dark"} translucent backgroundColor="transparent" />

      <View style={styles.content}>
        {children}
      </View>

      {/* Topbar overlay (transparent wrapper, only the glass card is visible) */}
      <View pointerEvents="box-none" style={[styles.topbarOverlay, { paddingBottom: insets.bottom }]}>
        <View style={[styles.topbarCardWrap, { paddingHorizontal: 12 }]}>
          <View style={[styles.topbarCard, TOKENS.shadowMedium]}>
            {/* glass */}
            <BlurView
              intensity={isDark ? 40 : 50}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={TOKENS.glassGrad as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={TOKENS.glassRefraction as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[StyleSheet.absoluteFill, { opacity: isDark ? 0.10 : 0.30 }]}
            />
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { borderWidth: StyleSheet.hairlineWidth, borderColor: TOKENS.ring, borderRadius: 18 },
              ]}
            />

            <View style={styles.topbarInner}>
              <View style={{ width: 40 }} />

              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.topbarTitle, { color: TOKENS.textPrimary }]}>OzSave</Text>
                <Text style={[styles.topbarSubtitle, { color: TOKENS.textMuted }]} numberOfLines={1}>
                  {hasHouse ? user.house?.name : "No house"}
                </Text>
              </View>

              <Pressable
                onPress={openDrawer}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.topbarBtn,
                  { backgroundColor: pressed ? TOKENS.btnBgHover : TOKENS.btnBg },
                ]}
              >
                <Ionicons name="menu" size={20} color={TOKENS.iconIdle} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* Drawer */}
      <Modal visible={open} transparent animationType="none" onRequestClose={closeDrawer}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={closeDrawer} />

          <Animated.View
            style={[
              styles.drawer,
              TOKENS.shadowHeavy,
              {
                paddingTop: insets.top + 12,
                paddingBottom: insets.bottom + 14,
                transform: [{ translateX: slideX }],
              },
            ]}
          >
            {/* glass */}
            {/* Strong blur (blurs content underneath) */}
            <BlurView
              intensity={isDark ? 55 : 75}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />

            {/* Frost layer (this is what makes it look like frosted glass,not just blur) */}
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: isDark ? "rgba(2,6,23,0.35)" : "rgba(255,255,255,0.22)",
                },
              ]}
            />

            {/* Optional: subtle gradient refraction (still neutral,no blue) */}
            <LinearGradient
              colors={
                isDark
                  ? ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.00)"]
                  : ["rgba(255,255,255,0.35)", "rgba(255,255,255,0.08)"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Ring/border */}
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.10)",
                  borderRadius: 18,
                },
              ]}
            />

            {/* Header */}
            <View style={[styles.drawerHeader, { borderBottomColor: TOKENS.divider }]}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.brand, { color: TOKENS.textPrimary }]}>OzSave</Text>
                <Text style={[styles.house, { color: TOKENS.textMuted }]} numberOfLines={1}>
                  {hasHouse ? user.house?.name : "No house"}
                </Text>
              </View>

              <Pressable
                onPress={closeDrawer}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.closeBtn,
                  { backgroundColor: pressed ? TOKENS.btnBgHover : TOKENS.btnBg },
                ]}
              >
                <Text style={{ fontSize: 16, color: TOKENS.textPrimary }}>✕</Text>
              </Pressable>
            </View>

            {/* User card */}
            <View
              style={[
                styles.userCard,
                { backgroundColor: TOKENS.userCardBg, borderColor: TOKENS.userCardBorder },
              ]}
            >
              <View style={[styles.avatar, { backgroundColor: TOKENS.iconActiveBg, borderColor: TOKENS.ring }]}>
                <Text style={[styles.avatarText, { color: TOKENS.textPrimary }]}>
                  {String(user.name ?? "?")
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((p) => p[0]?.toUpperCase())
                    .join("") || "?"}
                </Text>
              </View>

              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.loggedAs, { color: TOKENS.textMuted }]}>Logged in as</Text>
                <Text style={[styles.userName, { color: TOKENS.textPrimary }]} numberOfLines={1}>
                  {user.name}
                </Text>
              </View>
            </View>

            {/* Nav */}
            <View style={styles.nav}>
              {navItems.map((it) => {
                const active = isActive(it.href);
                return (
                  <Pressable
                    key={it.href}
                    onPress={() => onNavPress(it.href)}
                    style={({ pressed }) => [
                      styles.navItem,
                      {
                        backgroundColor: active ? TOKENS.activeBg : pressed ? TOKENS.itemPressedBg : "transparent",
                        borderWidth: active ? StyleSheet.hairlineWidth : 0,
                        borderColor: active ? TOKENS.activeRing : "transparent",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.iconWrap,
                        { backgroundColor: active ? TOKENS.iconActiveBg : TOKENS.iconIdleBg },
                      ]}
                    >
                      <Ionicons
                        name={it.icon}
                        size={18}
                        color={active ? TOKENS.iconActive : TOKENS.iconIdle}
                      />
                    </View>

                    <Text
                      style={[
                        styles.navText,
                        { color: active ? TOKENS.activeText : TOKENS.itemIdleText },
                      ]}
                      numberOfLines={1}
                    >
                      {it.name}
                    </Text>
                  </Pressable>
                );
              })}

              {adminItems.length > 0 && (
                <>
                  <Text style={[styles.sectionLabel, { color: TOKENS.textMuted }]}>ADMIN</Text>
                  {adminItems.map((it) => {
                    const active = isActive(it.href);
                    return (
                      <Pressable
                        key={it.href}
                        onPress={() => onNavPress(it.href)}
                        style={({ pressed }) => [
                          styles.navItem,
                          {
                            backgroundColor: active ? TOKENS.activeBg : pressed ? TOKENS.itemPressedBg : "transparent",
                            borderWidth: active ? StyleSheet.hairlineWidth : 0,
                            borderColor: active ? TOKENS.activeRing : "transparent",
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.iconWrap,
                            { backgroundColor: active ? TOKENS.iconActiveBg : TOKENS.iconIdleBg },
                          ]}
                        >
                          <Ionicons
                            name={it.icon}
                            size={18}
                            color={active ? TOKENS.iconActive : TOKENS.iconIdle}
                          />
                        </View>

                        <Text
                          style={[
                            styles.navText,
                            { color: active ? TOKENS.activeText : TOKENS.itemIdleText },
                          ]}
                          numberOfLines={1}
                        >
                          {it.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </>
              )}
            </View>

            {/* Footer */}
            <View style={[styles.drawerFooter, { borderTopColor: TOKENS.divider }]}>
              <View style={[styles.themeCardWrap, TOKENS.shadowMedium]}>
                <BlurView
                  intensity={isDark ? 18 : 22}
                  tint={isDark ? "dark" : "light"}
                  style={StyleSheet.absoluteFill}
                />
                <LinearGradient
                  colors={TOKENS.themeCardGrad as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View
                  pointerEvents="none"
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: TOKENS.themeCardBorder,
                      borderRadius: 18,
                    },
                  ]}
                />
                <View style={styles.themeCardInner}>
                  <ThemeToggle />
                </View>
              </View>

              <Pressable
                onPress={handleLogout}
                style={({ pressed }) => [
                  styles.logoutBtn,
                  {
                    backgroundColor: TOKENS.logoutBg,
                    borderColor: TOKENS.logoutBorder,
                    opacity: pressed ? 0.95 : 1,
                  },
                ]}
              >
                <View style={[styles.logoutIcon, { backgroundColor: TOKENS.logoutIconBg }]}>
                  <Ionicons
                    name="log-out-outline"
                    size={18}
                    color={isDark ? "rgba(254,202,202,0.95)" : "#B91C1C"}
                  />
                </View>
                <Text style={[styles.logoutText, { color: TOKENS.logoutText }]}>Logout</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  content: { flex: 1 },

  // Topbar overlay is transparent: only the card shows
  topbarOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    pointerEvents: "box-none",
  },
  topbarCardWrap: {
    // keeps the card aligned and allows touch
  },
  topbarCard: {
    borderRadius: 18,
    overflow: "hidden",
  },
  topbarInner: {
    height: TOPBAR_H,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  topbarBtn: {
    height: 40,
    width: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  topbarTitle: { fontSize: 14, fontWeight: "800" },
  topbarSubtitle: { fontSize: 12 },

  // Drawer
  modalRoot: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  drawer: {
    width: DRAWER_W,
    height: "100%",
    overflow: "hidden",
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
    position: "absolute",
    right: 0,
    top: 0,
  },

  drawerHeader: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  brand: { fontSize: 16, fontWeight: "800" },
  house: { marginTop: 2, fontSize: 12 },

  closeBtn: {
    height: 34,
    width: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  userCard: {
    marginTop: 12,
    marginHorizontal: 14,
    padding: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    height: 42,
    width: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  avatarText: { fontWeight: "900", fontSize: 12 },
  loggedAs: { fontSize: 11 },
  userName: { fontSize: 14, fontWeight: "800" },

  nav: { flex: 1, paddingHorizontal: 10, paddingTop: 12 },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 6,
  },
  iconWrap: {
    height: 34,
    width: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: { fontSize: 13, fontWeight: "800", flex: 1 },

  sectionLabel: {
    marginTop: 10,
    marginBottom: 8,
    paddingHorizontal: 10,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  drawerFooter: {
    padding: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },

  themeCardWrap: {
    borderRadius: 18,
    overflow: "hidden",
  },
  themeCardInner: {
    padding: 12,
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  logoutIcon: {
    height: 34,
    width: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: { fontSize: 13, fontWeight: "900" },
});