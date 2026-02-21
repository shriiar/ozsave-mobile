// src/modules/shell/DashboardShell.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { router, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

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

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const hasHouse = !!user?.house;
  const isAdmin = user?.role === "admin";

  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  // drawer slide
  const slideX = useRef(new Animated.Value(-280)).current;

  // prevent redirect loops
  const lastRedirectRef = useRef<string | null>(null);

  function closeDrawer() {
    Animated.timing(slideX, {
      toValue: -280,
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

  // close drawer on route change
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

  // same active logic as web
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

  // ===== UI TOKENS: match WEB "clear glass" =====
  const TOKENS = useMemo(() => {
    const shellBg = isDark ? "#020617" : "#F5F7FB";

    // --- Drawer shell (web sidebarShell) ---
    const sidebarGrad = isDark
      ? ["rgba(15,23,42,0.45)", "rgba(15,23,42,0.30)", "rgba(15,23,42,0.20)"]
      : ["rgba(255,255,255,0.35)", "rgba(255,255,255,0.25)", "rgba(255,255,255,0.15)"];

    const sidebarRefraction = isDark
      ? ["rgba(255,255,255,0.10)", "rgba(255,255,255,0.00)"]
      : ["rgba(255,255,255,0.60)", "rgba(255,255,255,0.00)"];

    const ring = isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.60)";

    const sidebarShadow = isDark
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

    const textPrimary = isDark ? "rgba(255,255,255,0.92)" : "#0F172A";
    const textMuted = isDark ? "rgba(148,163,184,0.95)" : "#475569";

    // --- Topbar shell (web topbarShell) ---
    const topbarGrad = isDark
      ? ["rgba(15,23,42,0.45)", "rgba(15,23,42,0.30)", "rgba(15,23,42,0.20)"]
      : ["rgba(255,255,255,0.35)", "rgba(255,255,255,0.25)", "rgba(255,255,255,0.15)"];

    const topbarShadow = isDark
      ? {
          shadowColor: "#000",
          shadowOpacity: 0.55,
          shadowRadius: 36,
          shadowOffset: { width: 0, height: 18 },
          elevation: 14,
        }
      : {
          shadowColor: "#000",
          shadowOpacity: 0.10,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 12 },
          elevation: 10,
        };

    const topbarBtnBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
    const topbarBtnBgHover = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";

    // --- Items (web itemIdle/itemActive + iconWrap) ---
    const itemIdleText = isDark ? "rgba(226,232,240,0.92)" : "#334155";
    const itemIdleBg = isDark ? "rgba(255,255,255,0.00)" : "rgba(0,0,0,0.00)";
    const itemIdleBgPressed = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

    const activeBg = isDark ? "rgba(15,23,42,0.60)" : "rgba(255,255,255,0.65)";
    const activeRing = isDark ? "rgba(129,140,248,0.25)" : "rgba(99,102,241,0.30)";
    const activeText = isDark ? "rgba(199,210,254,0.95)" : "#4338CA";
    const activeShadow = isDark
      ? {
          shadowColor: "#000",
          shadowOpacity: 0.45,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 12 },
          elevation: 10,
        }
      : {
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 8,
        };

    const iconIdleBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
    const iconIdle = isDark ? "rgba(226,232,240,0.92)" : "#334155";

    const iconActiveBg = isDark ? "rgba(129,140,248,0.18)" : "rgba(79,70,229,0.15)";
    const iconActive = isDark ? "rgba(199,210,254,0.95)" : "#4F46E5";

    // --- Header/User card (web user card) ---
    const divider = isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.40)";

    const userCardBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.60)";
    const userCardBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.50)";

    // --- Light glows like web (only light mode) ---
    const glowTop = ["rgba(99,102,241,0.30)", "rgba(191,219,254,0.20)", "rgba(0,0,0,0)"];
    const glowBottom = ["rgba(192,132,252,0.20)", "rgba(199,210,254,0.15)", "rgba(0,0,0,0)"];

    // --- Theme toggle container (web footer theme card) ---
    const themeCardGrad = isDark
      ? ["rgba(15,23,42,0.80)", "rgba(15,23,42,0.60)", "rgba(15,23,42,0.40)"]
      : ["rgba(255,255,255,0.90)", "rgba(255,255,255,0.70)", "rgba(255,255,255,0.50)"];

    const themeCardBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";

    const themeCardShadow = isDark
      ? {
          shadowColor: "#000",
          shadowOpacity: 0.6,
          shadowRadius: 28,
          shadowOffset: { width: 0, height: 16 },
          elevation: 12,
        }
      : {
          shadowColor: "#000",
          shadowOpacity: 0.10,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 8,
        };

    // --- Logout button (web red glass) ---
    const logoutBg = isDark ? "rgba(239,68,68,0.10)" : "rgba(239,68,68,0.10)";
    const logoutBorder = "rgba(239,68,68,0.25)";
    const logoutText = isDark ? "rgba(254,202,202,0.95)" : "#B91C1C";
    const logoutIconBg = "rgba(239,68,68,0.12)";

    return {
      shellBg,

      // topbar
      topbarGrad,
      topbarShadow,
      topbarBtnBg,
      topbarBtnBgHover,

      // drawer shell
      sidebarGrad,
      sidebarRefraction,
      ring,
      sidebarShadow,

      // text
      textPrimary,
      textMuted,

      // items
      itemIdleText,
      itemIdleBg,
      itemIdleBgPressed,
      activeBg,
      activeRing,
      activeText,
      activeShadow,
      iconIdleBg,
      iconIdle,
      iconActiveBg,
      iconActive,

      // dividers/cards
      divider,
      userCardBg,
      userCardBorder,

      // glows
      glowTop,
      glowBottom,

      // footer cards
      themeCardGrad,
      themeCardBorder,
      themeCardShadow,

      // logout
      logoutBg,
      logoutBorder,
      logoutText,
      logoutIconBg,
    };
  }, [isDark]);

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.screen,
          { backgroundColor: TOKENS.shellBg, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ opacity: 0.6, color: TOKENS.textMuted }}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView
        style={[
          styles.screen,
          { backgroundColor: TOKENS.shellBg, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ opacity: 0.6, color: TOKENS.textMuted }}>Redirecting...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: TOKENS.shellBg }]}>
      {/* ===== Topbar (web-like glass shell) ===== */}
      <View style={[styles.topbarWrap]}>
        <View style={[styles.topbarShell, TOKENS.topbarShadow]}>
          {/* layers */}
          <BlurView
            intensity={isDark ? 18 : 22} // clear glass (less blur than “milky”)
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={TOKENS.topbarGrad as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={TOKENS.sidebarRefraction as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[StyleSheet.absoluteFill, { opacity: isDark ? 0.10 : 0.30 }]}
          />

          {/* ring */}
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { borderWidth: StyleSheet.hairlineWidth, borderColor: TOKENS.ring, borderRadius: 18 },
            ]}
          />

          <View style={styles.topbarInner}>
            <Pressable
              onPress={openDrawer}
              hitSlop={10}
              style={({ pressed }) => [
                styles.topbarBtn,
                { backgroundColor: pressed ? TOKENS.topbarBtnBgHover : TOKENS.topbarBtnBg },
              ]}
            >
              <Ionicons name="menu" size={20} color={TOKENS.iconIdle} style={{ marginTop: -1 }} />
            </Pressable>

            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.topbarTitle, { color: TOKENS.textPrimary }]}>OzSave</Text>
              <Text style={[styles.topbarSubtitle, { color: TOKENS.textMuted }]} numberOfLines={1}>
                {hasHouse ? user.house?.name : "No house"}
              </Text>
            </View>

            <View style={{ width: 40 }} />
          </View>
        </View>
      </View>

      {/* Main */}
      <View style={styles.content}>{children}</View>

      {/* ===== Drawer ===== */}
      <Modal visible={open} transparent animationType="none" onRequestClose={closeDrawer}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={closeDrawer} />

          <Animated.View
            style={[
              styles.drawer,
              TOKENS.sidebarShadow,
              {
                paddingTop: insets.top + 12,
                paddingBottom: insets.bottom + 14,
                transform: [{ translateX: slideX }],
              },
            ]}
          >
            {/* GLASS LAYERS */}
            <BlurView
              intensity={isDark ? 18 : 22} // clearer glass
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={TOKENS.sidebarGrad as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={TOKENS.sidebarRefraction as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[StyleSheet.absoluteFill, { opacity: isDark ? 0.10 : 0.30 }]}
            />

            {/* ring */}
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRightWidth: StyleSheet.hairlineWidth,
                  borderRightColor: TOKENS.ring,
                },
              ]}
            />

            {/* LIGHT MODE GLOWS (like web) */}
            {!isDark ? (
              <>
                <LinearGradient
                  colors={TOKENS.glowTop as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.glowTop}
                />
                <LinearGradient
                  colors={TOKENS.glowBottom as any}
                  start={{ x: 1, y: 1 }}
                  end={{ x: 0, y: 0 }}
                  style={styles.glowBottom}
                />
              </>
            ) : null}

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
                  { backgroundColor: pressed ? TOKENS.topbarBtnBgHover : TOKENS.topbarBtnBg },
                ]}
              >
                <Text style={{ fontSize: 16, color: TOKENS.textPrimary }}>✕</Text>
              </Pressable>
            </View>

            {/* User card (web style) */}
            <View
              style={[
                styles.userCard,
                {
                  backgroundColor: TOKENS.userCardBg,
                  borderColor: TOKENS.userCardBorder,
                },
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
                        backgroundColor: active
                          ? TOKENS.activeBg
                          : pressed
                          ? TOKENS.itemIdleBgPressed
                          : TOKENS.itemIdleBg,
                        borderWidth: active ? StyleSheet.hairlineWidth : 0,
                        borderColor: active ? TOKENS.activeRing : "transparent",
                      },
                      active ? TOKENS.activeShadow : null,
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
                            backgroundColor: active
                              ? TOKENS.activeBg
                              : pressed
                              ? TOKENS.itemIdleBgPressed
                              : TOKENS.itemIdleBg,
                            borderWidth: active ? StyleSheet.hairlineWidth : 0,
                            borderColor: active ? TOKENS.activeRing : "transparent",
                          },
                          active ? TOKENS.activeShadow : null,
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

            {/* Footer (web-style theme card + logout glass) */}
            <View style={[styles.drawerFooter, { borderTopColor: TOKENS.divider }]}>
              {/* Theme card */}
              <View style={[styles.themeCardWrap, TOKENS.themeCardShadow]}>
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

              {/* Logout (web red glass) */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  // ===== Topbar glass shell =====
  topbarWrap: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  topbarShell: {
    borderRadius: 18,
    overflow: "hidden",
  },
  topbarInner: {
    minHeight: 48,
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
  content: { flex: 1 },

  // ===== Drawer =====
  modalRoot: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },

  drawer: {
    width: 280,
    height: "100%",
    overflow: "hidden",
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
  },

  glowTop: {
    position: "absolute",
    top: -96,
    left: -96,
    height: 288,
    width: 288,
    opacity: 0.9,
  },
  glowBottom: {
    position: "absolute",
    bottom: -128,
    right: -96,
    height: 288,
    width: 288,
    opacity: 0.9,
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

  // Theme card wrapper (web-like)
  themeCardWrap: {
    borderRadius: 18,
    overflow: "hidden",
  },
  themeCardInner: {
    padding: 12,
  },

  // Logout (web red glass)
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