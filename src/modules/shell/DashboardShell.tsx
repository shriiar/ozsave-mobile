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

  // slide animation
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

  // ===== Guards (layout-safe) =====
  useEffect(() => {
    if (loading) return;
    if (!pathname) return;

    const redirect = (to: string) => {
      if (lastRedirectRef.current === to) return;
      lastRedirectRef.current = to;
      router.replace(to as any);
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
    if (!hasHouse) {
      return [{ name: "Home", href: ROUTES.home, icon: "home-outline" }];
    }
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

  // EXACT same active logic as web
  function isActive(href: string) {
    return pathname === href || (href !== ROUTES.home && pathname.startsWith(href));
  }

  // if already active -> close only (no navigation)
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

  // ===== THEME TOKENS (mobile mirror of web tokens) =====
  const TOKENS = useMemo(() => {
    const shellBg = isDark ? "#020617" : "#F5F7FB";

    // sidebar glass base (matches web gradients)
    const sidebarGrad = isDark
      ? ["rgba(15,23,42,0.45)", "rgba(15,23,42,0.30)", "rgba(15,23,42,0.20)"]
      : ["rgba(255,255,255,0.35)", "rgba(255,255,255,0.25)", "rgba(255,255,255,0.15)"];

    const sidebarRefraction = isDark
      ? ["rgba(255,255,255,0.10)", "rgba(255,255,255,0.00)"]
      : ["rgba(255,255,255,0.60)", "rgba(255,255,255,0.00)"];

    const ring = isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.60)";

    const shadow = isDark
      ? { shadowColor: "#000", shadowOpacity: 0.65, shadowRadius: 40, shadowOffset: { width: 0, height: 20 }, elevation: 18 }
      : { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 8 };

    const textPrimary = isDark ? "rgba(255,255,255,0.92)" : "#111827";
    const textMuted = isDark ? "rgba(148,163,184,0.95)" : "#6B7280";

    const itemIdleText = isDark ? "rgba(226,232,240,0.92)" : "#334155";
    const itemHoverBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

    const activeBg = isDark ? "rgba(15,23,42,0.60)" : "rgba(255,255,255,0.65)";
    const activeRing = isDark ? "rgba(129,140,248,0.25)" : "rgba(99,102,241,0.30)";
    const activeText = isDark ? "rgba(199,210,254,0.95)" : "#4338CA";
    const activeIconBg = isDark ? "rgba(129,140,248,0.18)" : "rgba(79,70,229,0.15)";

    const iconIdleBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
    const iconIdle = isDark ? "rgba(226,232,240,0.92)" : "#111827";
    const iconActive = "#4F46E5";

    const userCardBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.60)";
    const userCardBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.50)";

    const divider = isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.40)";

    // glows (light only)
    const glowTop = ["rgba(99,102,241,0.30)", "rgba(191,219,254,0.20)", "rgba(0,0,0,0)"]; // indigo -> blue -> transparent
    const glowBottom = ["rgba(192,132,252,0.20)", "rgba(199,210,254,0.15)", "rgba(0,0,0,0)"]; // purple -> indigo -> transparent

    return {
      shellBg,
      sidebarGrad,
      sidebarRefraction,
      ring,
      shadow,
      textPrimary,
      textMuted,
      itemIdleText,
      itemHoverBg,
      activeBg,
      activeRing,
      activeText,
      activeIconBg,
      iconIdleBg,
      iconIdle,
      iconActive,
      userCardBg,
      userCardBorder,
      divider,
      glowTop,
      glowBottom,
    };
  }, [isDark]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: TOKENS.shellBg, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ opacity: 0.6, color: TOKENS.textMuted }}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: TOKENS.shellBg, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ opacity: 0.6, color: TOKENS.textMuted }}>Redirecting...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: TOKENS.shellBg }]}>
      {/* Topbar */}
      <View style={[styles.topbar, { borderBottomColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)" }]}>
        <Pressable onPress={openDrawer} style={[styles.topbarBtn, { backgroundColor: TOKENS.iconIdleBg }]} hitSlop={10}>
          <Ionicons name="menu" size={20} color={TOKENS.iconIdle} style={{ marginTop: -1 }} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={[styles.topbarTitle, { color: TOKENS.textPrimary }]}>OzSave</Text>
          <Text style={[styles.topbarSubtitle, { color: TOKENS.textMuted }]} numberOfLines={1}>
            {hasHouse ? user.house?.name : "No house"}
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Main */}
      <View style={styles.content}>{children}</View>

      {/* Drawer */}
      <Modal visible={open} transparent animationType="none" onRequestClose={closeDrawer}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={closeDrawer} />

          <Animated.View
            style={[
              styles.drawer,
              TOKENS.shadow,
              {
                paddingTop: insets.top + 12,
                paddingBottom: insets.bottom + 14,
                borderRightColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.12)",
                transform: [{ translateX: slideX }],
              },
            ]}
          >
            {/* GLASS LAYERS (blur + gradient + refraction) */}
            <BlurView intensity={22} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
            <LinearGradient colors={TOKENS.sidebarGrad as [string, string, ...string[]]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={TOKENS.sidebarRefraction as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[StyleSheet.absoluteFill, { opacity: isDark ? 0.10 : 0.30 }]}
            />

            {/* ring like web */}
            <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: TOKENS.ring }]} />

            {/* LIGHT MODE GLOWS (web has these) */}
            {!isDark ? (
              <>
                <LinearGradient
                  colors={TOKENS.glowTop as [string, string, ...string[]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.glowTop}
                />
                <LinearGradient
                  colors={TOKENS.glowBottom as [string, string, ...string[]]}
                  start={{ x: 1, y: 1 }}
                  end={{ x: 0, y: 0 }}
                  style={styles.glowBottom}
                />
              </>
            ) : null}

            {/* Header */}
            <View style={[styles.drawerHeader, { borderBottomColor: TOKENS.divider }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.brand, { color: TOKENS.textPrimary }]}>OzSave</Text>
                <Text style={[styles.house, { color: TOKENS.textMuted }]} numberOfLines={1}>
                  {hasHouse ? user.house?.name : "No house"}
                </Text>
              </View>

              <Pressable onPress={closeDrawer} style={[styles.closeBtn, { backgroundColor: TOKENS.iconIdleBg }]} hitSlop={10}>
                <Text style={{ fontSize: 16, color: TOKENS.textPrimary }}>✕</Text>
              </Pressable>
            </View>

            {/* User card */}
            <View style={[styles.userCard, { backgroundColor: TOKENS.userCardBg, borderColor: TOKENS.userCardBorder }]}>
              <View style={[styles.avatar, { backgroundColor: TOKENS.activeIconBg, borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)" }]}>
                <Text style={[styles.avatarText, { color: TOKENS.textPrimary }]}>
                  {String(user.name ?? "?")
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((p) => p[0]?.toUpperCase())
                    .join("") || "?"}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
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
                    style={[
                      styles.navItem,
                      { backgroundColor: "transparent" },
                      active && {
                        backgroundColor: TOKENS.activeBg,
                        borderWidth: StyleSheet.hairlineWidth,
                        borderColor: TOKENS.activeRing,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.iconWrap,
                        { backgroundColor: TOKENS.iconIdleBg },
                        active && { backgroundColor: TOKENS.activeIconBg },
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
                        { color: TOKENS.itemIdleText },
                        active && { color: TOKENS.activeText },
                      ]}
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
                        style={[
                          styles.navItem,
                          { backgroundColor: "transparent" },
                          active && {
                            backgroundColor: TOKENS.activeBg,
                            borderWidth: StyleSheet.hairlineWidth,
                            borderColor: TOKENS.activeRing,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.iconWrap,
                            { backgroundColor: TOKENS.iconIdleBg },
                            active && { backgroundColor: TOKENS.activeIconBg },
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
                            { color: TOKENS.itemIdleText },
                            active && { color: TOKENS.activeText },
                          ]}
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
              <ThemeToggle />

              <Pressable
                onPress={handleLogout}
                style={[
                  styles.logoutBtn,
                  {
                    backgroundColor: isDark ? "rgba(239,68,68,0.10)" : "rgba(239,68,68,0.10)",
                    borderColor: "rgba(239,68,68,0.25)",
                  },
                ]}
              >
                <View style={[styles.logoutIcon, { backgroundColor: "rgba(239,68,68,0.12)" }]}>
                  <Ionicons name="log-out-outline" size={18} color="#B91C1C" />
                </View>
                <Text style={styles.logoutText}>Logout</Text>
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

  topbar: {
    paddingHorizontal: 12,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  topbarBtn: {
    height: 40,
    width: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  topbarTitle: { fontSize: 14, fontWeight: "700" },
  topbarSubtitle: { fontSize: 12 },
  content: { flex: 1 },

  modalRoot: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },

  drawer: {
    width: 280,
    height: "100%",
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 0,
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
  avatarText: { fontWeight: "800", fontSize: 12 },
  loggedAs: { fontSize: 11 },
  userName: { fontSize: 14, fontWeight: "700" },

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
  navText: { fontSize: 13, fontWeight: "700" },

  sectionLabel: {
    marginTop: 10,
    marginBottom: 8,
    paddingHorizontal: 10,
    fontSize: 11,
    fontWeight: "800",
  },

  drawerFooter: {
    padding: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
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
  logoutText: { fontSize: 13, fontWeight: "800", color: "#B91C1C" },
});