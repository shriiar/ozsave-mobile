// src/modules/shell/DashboardShell.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
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

export const PILL_H = 58;

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const insets = useSafeAreaInsets();

  const hasHouse = !!user?.house;
  const isAdmin = user?.role === "admin";
  const FLOAT_GAP = insets.bottom - 10;

  // ===== Guards (same logic) =====
  const lastRedirectRef = useRef<string | null>(null);
  useEffect(() => {
    if (loading) return;
    if (!pathname) return;

    const redirect = (to: string) => {
      if (pathname === to) return;
      if (lastRedirectRef.current === to) return;
      lastRedirectRef.current = to;
      requestAnimationFrame(() => router.replace(to as any));
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

  // ===== Nav items =====
  const navItems: NavItem[] = useMemo(() => {
    if (!hasHouse) return [{ name: "Home", href: ROUTES.home, icon: "home-outline" }];
    return [
      { name: "Home", href: ROUTES.home, icon: "home-outline" },
      { name: "Costs", href: ROUTES.cost, icon: "receipt-outline" },
      { name: "Income", href: ROUTES.income, icon: "wallet-outline" },
      { name: "Billing", href: ROUTES.billing, icon: "card-outline" },
    ];
  }, [hasHouse]);

  const adminItems: NavItem[] = useMemo(() => {
    if (!hasHouse || !isAdmin) return [];
    return [{ name: "Users & Invites", href: ROUTES.adminUsers, icon: "people-outline" }];
  }, [hasHouse, isAdmin]);

  function isActive(href: string) {
    return pathname === href || (href !== ROUTES.home && pathname.startsWith(href));
  }

  function go(href: string) {
    if (isActive(href)) return;
    router.push(href as any);
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.replace(ROUTES.login as any);
    }
  }

  // ===== Bottom sheet expansion (CLEAN VERSION) =====
  const [open, setOpen] = useState(false);       // user intent: expanded or not
  const [visible, setVisible] = useState(false); // render expanded content while animating


  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(10)).current; // small slide

  // translateY sheet (keeps layout the same). CLOSED = 0, OPEN = -OPEN_OFFSET
  const SCREEN_H = Dimensions.get("window").height;
  const MAX_OPEN = Math.round(SCREEN_H * 0.82);
  const sheetH = useRef(new Animated.Value(PILL_H)).current; // start collapsed height


  function openSheet() {
    if (open) return;

    setVisible(true);
    setOpen(true);

    contentOpacity.setValue(0);
    contentY.setValue(10);

    Animated.sequence([
      Animated.spring(sheetH, {
        toValue: MAX_OPEN,
        damping: 22,
        stiffness: 160,
        mass: 0.95,
        overshootClamping: true,
        useNativeDriver: false, // HEIGHT ANIMATION
      }),
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(contentY, { toValue: 0, duration: 120, useNativeDriver: true }),
      ]),
    ]).start();
  }

  function closeSheet() {
    if (!open) return;

    setOpen(false);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 0, duration: 90, useNativeDriver: true }),
        Animated.timing(contentY, { toValue: 10, duration: 90, useNativeDriver: true }),
      ]),
      Animated.spring(sheetH, {
        toValue: PILL_H,
        velocity: 2,
        damping: 22,
        stiffness: 160,
        mass: 0.95,
        overshootClamping: true,
        useNativeDriver: false, // HEIGHT ANIMATION
      }),
    ]).start(({ finished }) => {
      if (finished) setVisible(false);
    });
  }

  // close on route change
  useEffect(() => {
    if (open) closeSheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ===== TOKENS =====
  const TOKENS = useMemo(() => {
    const shellBg = isDark ? "#020617" : "#F5F7FB";

    const glassGrad = isDark
      ? ["rgba(15,23,42,0.26)", "rgba(15,23,42,0.18)", "rgba(15,23,42,0.12)"]
      : ["rgba(255,255,255,0.22)", "rgba(255,255,255,0.16)", "rgba(255,255,255,0.10)"];

    const glassRefraction = isDark
      ? ["rgba(255,255,255,0.10)", "rgba(255,255,255,0.00)"]
      : ["rgba(255,255,255,0.60)", "rgba(255,255,255,0.00)"];

    const ring = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";

    const shadow = isDark
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

    const btnBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
    const btnBgHover = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";

    const activeBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
    const activeRing = isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.10)";

    const itemBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
    const divider = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";

    const dangerText = isDark ? "rgba(254,202,202,0.95)" : "#B91C1C";
    const dangerBg = "rgba(239,68,68,0.10)";
    const dangerBorder = "rgba(239,68,68,0.25)";

    return {
      shellBg,
      glassGrad,
      glassRefraction,
      ring,
      shadow,
      textPrimary,
      textMuted,
      btnBg,
      btnBgHover,
      activeBg,
      activeRing,
      itemBg,
      divider,
      dangerText,
      dangerBg,
      dangerBorder,
    };
  }, [isDark]);

  if (loading) {
    return (
      <View style={[styles.screen, { backgroundColor: TOKENS.shellBg, justifyContent: "center", alignItems: "center" }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Text style={{ color: TOKENS.textMuted }}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.screen, { backgroundColor: TOKENS.shellBg, justifyContent: "center", alignItems: "center" }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Text style={{ color: TOKENS.textMuted }}>Redirecting...</Text>
      </View>
    );
  }

  // Bottom padding so screens can scroll above pill
  const bottomPad = PILL_H + insets.bottom + 14;

  return (
    <View style={[styles.screen, { backgroundColor: TOKENS.shellBg }]}>
      <StatusBar style={isDark ? "light" : "dark"} translucent backgroundColor="transparent" />

      <View style={[styles.content]}>
        {children}
      </View>

      {visible && <Pressable onPress={closeSheet} style={StyleSheet.absoluteFillObject} />}

      {/* Bottom pill / expanding sheet */}
      <View pointerEvents="box-none" style={[styles.bottomOverlay, { bottom: FLOAT_GAP }]}>
        <Animated.View
          style={[
            styles.pill,
            TOKENS.shadow,
            {
              height: sheetH, // animated height
            }
          ]}
        >
          {/* glass layers must NOT steal touches */}
          <BlurView
            pointerEvents="none"
            intensity={isDark ? 42 : 25}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            pointerEvents="none"
            colors={TOKENS.glassGrad as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            pointerEvents="none"
            colors={TOKENS.glassRefraction as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[StyleSheet.absoluteFill, { opacity: isDark ? 0.10 : 0.30 }]}
          />
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { borderWidth: StyleSheet.hairlineWidth, borderColor: TOKENS.ring, borderRadius: 22 },
            ]}
          />

          {/* Expanded content */}
          {visible && (
            <Animated.View
              style={[
                styles.menuWrap,
                {
                  opacity: contentOpacity,
                  transform: [{ translateY: contentY }],
                },
              ]}
              pointerEvents={open ? "auto" : "none"}
            >
              {/* Header (fixed) */}
              <View style={[styles.menuHeader, { borderBottomColor: TOKENS.divider }]}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.brand, { color: TOKENS.textPrimary }]}>OzSave</Text>
                  <Text style={[styles.sub, { color: TOKENS.textMuted }]} numberOfLines={1}>
                    {hasHouse ? user.house?.name : "No house"}
                  </Text>
                </View>

                <Pressable
                  onPress={closeSheet}
                  hitSlop={10}
                  style={({ pressed }) => [
                    styles.smallBtn,
                    { backgroundColor: pressed ? TOKENS.btnBgHover : TOKENS.btnBg },
                  ]}
                >
                  <Ionicons name="chevron-down" size={20} color={TOKENS.textPrimary} />
                </Pressable>
              </View>

              <View style={styles.listWrap}>
                <Animated.ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingTop: 10, paddingBottom: 10 }}
                >
                  {[...navItems, ...adminItems].map((it) => {
                    const active = isActive(it.href);
                    return (
                      <Pressable
                        key={it.href}
                        onPress={() => {
                          closeSheet();
                          go(it.href);
                        }}
                        style={({ pressed }) => [
                          styles.listItem,
                          {
                            backgroundColor: active ? TOKENS.activeBg : pressed ? TOKENS.itemBg : "transparent",
                            borderWidth: active ? StyleSheet.hairlineWidth : 0,
                            borderColor: active ? TOKENS.activeRing : "transparent",
                          },
                        ]}
                      >
                        <View style={[styles.listIcon, { backgroundColor: TOKENS.btnBg }]}>
                          <Ionicons name={it.icon} size={18} color={TOKENS.textPrimary} />
                        </View>
                        <Text style={[styles.listText, { color: TOKENS.textPrimary }]}>{it.name}</Text>
                      </Pressable>
                    );
                  })}
                </Animated.ScrollView>
              </View>

              {/* Footer (fixed) */}
              <View style={[styles.footer, { borderTopColor: TOKENS.divider }]}>
                <ThemeToggle />

                <Pressable
                  onPress={handleLogout}
                  style={({ pressed }) => [
                    styles.logoutBtn,
                    {
                      backgroundColor: TOKENS.dangerBg,
                      borderColor: TOKENS.dangerBorder,
                      opacity: pressed ? 0.95 : 1,
                    },
                  ]}
                >
                  <Ionicons name="log-out-outline" size={18} color={TOKENS.dangerText} />
                  <Text style={[styles.logoutText, { color: TOKENS.dangerText }]}>Logout</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}

          <Animated.View style={styles.row}>
            {navItems.slice(0, 4).map((it) => {
              const active = isActive(it.href);
              return (
                <Pressable
                  key={it.href}
                  onPress={() => go(it.href)}
                  style={({ pressed }) => [
                    styles.tabBtn,
                    {
                      backgroundColor: active
                        ? TOKENS.activeBg
                        : pressed
                          ? TOKENS.btnBgHover
                          : "transparent",
                      borderWidth: active ? StyleSheet.hairlineWidth : 0,
                      borderColor: active ? TOKENS.activeRing : "transparent",
                    },
                  ]}
                >
                  <Ionicons
                    name={it.icon}
                    size={22}
                    color={active ? TOKENS.textPrimary : TOKENS.textMuted}
                  />
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => (open ? closeSheet() : openSheet())}
              style={({ pressed }) => [
                styles.menuBtn,
                { backgroundColor: pressed ? TOKENS.btnBgHover : TOKENS.btnBg },
              ]}
            >
              <Ionicons name={open ? "chevron-down" : "menu"} size={22} color={TOKENS.textPrimary} />
            </Pressable>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flex: 1 },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    zIndex: 40,
  },

  bottomOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    alignItems: "center",
    pointerEvents: "box-none",
  },

  pill: {
    width: "94%",
    borderRadius: 22,
    overflow: "hidden",
    position: "relative", // IMPORTANT
  },

  // expanded content sits above the icon row
  menuWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: PILL_H, // IMPORTANT: leaves space for the pinned row
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },

  listWrap: {
    flex: 1,
    minHeight: 0,
  },

  menuHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  brand: { fontSize: 16, fontWeight: "700" },
  sub: { marginTop: 2, fontSize: 12, opacity: 0.9 },

  smallBtn: {
    height: 34,
    width: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 8,
  },
  listIcon: {
    height: 34,
    width: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  listText: { fontSize: 13, fontWeight: "700" },

  footer: {
    marginTop: 10,
    paddingTop: 10,
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
  logoutText: { fontSize: 13, fontWeight: "700" },

  // bottom tabs row
  row: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: PILL_H,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  menuBtn: {
    height: 44,
    width: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});