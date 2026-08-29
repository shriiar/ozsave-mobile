// src/modules/shell/DashboardShell.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Platform,
} from "react-native";
import { router, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { GlassView } from "expo-glass-effect";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useGlassStyle } from "../../context/GlassStyleContext";
import { fireScrollToTop } from "../../lib/scrollToTop";
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

const PILL_RADIUS = 22;

function GlassSurface({
  children,
  isDark,
  expanded,
  fallbackStyle,
}: {
  children: React.ReactNode;
  isDark: boolean;
  expanded: boolean;
  fallbackStyle: any;
}) {
  const { glassStyle } = useGlassStyle();
  if (Platform.OS === "ios") {
    return (
      <GlassView
        style={styles.glassFill}
        glassEffectStyle={glassStyle}
        colorScheme={isDark ? "dark" : "light"}
      >
        {children}
      </GlassView>
    );
  }

  return <View style={[styles.glassFill, fallbackStyle]}>{children}</View>;
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const insets = useSafeAreaInsets();

  const hasHouse = !!user?.house;
  const isAdmin = user?.role === "admin";
  const FLOAT_GAP = insets.bottom - 15;

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
    if (isActive(href)) {
      fireScrollToTop(href);
      return;
    }
    router.navigate(href as any);
  }

  const tabs = navItems.slice(0, 4);

  const pathnameRef = useRef(pathname);
  useEffect(() => { pathnameRef.current = pathname; }, [pathname]);

  const tabsRef = useRef(tabs);
  useEffect(() => { tabsRef.current = tabs; }, [tabs]);

  const [tabsAreaWidth, setTabsAreaWidth] = useState(0);
  const tabsAreaWidthRef = useRef(0);

  const activeIdxNow = () => {
    const current = tabsRef.current;
    return current.findIndex(
      (t) => pathnameRef.current === t.href ||
        (t.href !== ROUTES.home && pathnameRef.current.startsWith(t.href))
    );
  };

  const initialIdx = tabs.findIndex(
    (t) => pathname === t.href || (t.href !== ROUTES.home && pathname.startsWith(t.href))
  );
  const indicatorAnim = useRef(new Animated.Value(Math.max(0, initialIdx))).current;

  // Sync indicator when route changes via tap (not swipe)
  useEffect(() => {
    const idx = activeIdxNow();
    if (idx >= 0) {
      Animated.spring(indicatorAnim, {
        toValue: idx,
        useNativeDriver: true,
        damping: 20,
        mass: 0.5,
        stiffness: 260,
      }).start();
    }
  }, [pathname]);

  const swipePan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, { dx, dy }) =>
        Math.abs(dx) > 15 && Math.abs(dx) > Math.abs(dy) * 2,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        indicatorAnim.stopAnimation();
        Animated.spring(pillScale, { toValue: 1.03, useNativeDriver: true, damping: 8, mass: 0.4, stiffness: 300 }).start();
      },
      onPanResponderMove: (_, { dx }) => {
        const w = tabsAreaWidthRef.current;
        if (!w) return;
        const tabW = w / tabsRef.current.length;
        const baseIdx = activeIdxNow();
        if (baseIdx === -1) return;
        const rawTarget = baseIdx + dx / tabW;
        const clamped = Math.max(0, Math.min(tabsRef.current.length - 1, rawTarget));
        indicatorAnim.setValue(clamped);

        // Rubber-band stretch when dragging past first or last tab
        const overflow = rawTarget < 0 ? -rawTarget : rawTarget > tabsRef.current.length - 1 ? rawTarget - (tabsRef.current.length - 1) : 0;
        const stretch = 1 + Math.min(overflow * 0.04, 0.07);
        pillScaleX.setValue(stretch);
      },
      onPanResponderRelease: (_, { dx, vx }) => {
        const current = tabsRef.current;
        const baseIdx = activeIdxNow();
        if (baseIdx === -1) return;

        const w = tabsAreaWidthRef.current;
        const tabW = w ? w / current.length : 80;

        // Calculate target from actual drag distance — supports skipping multiple tabs
        const rawTarget = baseIdx + dx / tabW;
        let targetIdx: number;
        if (Math.abs(dx) < 15 && Math.abs(vx) < 0.3) {
          targetIdx = baseIdx; // tiny movement — snap back
        } else {
          // Round toward the direction of movement; velocity nudges past the midpoint
          targetIdx = Math.round(rawTarget + vx * 0.15);
          targetIdx = Math.max(0, Math.min(current.length - 1, targetIdx));
        }

        Animated.spring(indicatorAnim, {
          toValue: targetIdx,
          useNativeDriver: true,
          damping: 20,
          mass: 0.5,
          stiffness: 260,
        }).start();

        if (targetIdx !== baseIdx) go(current[targetIdx].href);
        Animated.spring(pillScale, { toValue: 1, useNativeDriver: true, damping: 9, mass: 0.5, stiffness: 200 }).start();
        Animated.spring(pillScaleX, { toValue: 1, useNativeDriver: true, damping: 8, mass: 0.5, stiffness: 220 }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(pillScale, { toValue: 1, useNativeDriver: true, damping: 9, mass: 0.5, stiffness: 200 }).start();
        Animated.spring(pillScaleX, { toValue: 1, useNativeDriver: true, damping: 8, mass: 0.5, stiffness: 220 }).start();
      },
    })
  ).current;

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.replace(ROUTES.login as any);
    }
  }

  // ===== Pill bounce + stretch physics =====
  const pillScale = useRef(new Animated.Value(1)).current;
  const pillScaleX = useRef(new Animated.Value(1)).current;

  function expandPill() {
    Animated.spring(pillScale, {
      toValue: 1.03,
      useNativeDriver: true,
      damping: 8,
      mass: 0.4,
      stiffness: 300,
    }).start();
  }

  function shrinkPill() {
    Animated.spring(pillScale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 9,
      mass: 0.5,
      stiffness: 200,
    }).start();
  }

  // ===== Bottom sheet expansion (CLEAN VERSION) =====
  const [open, setOpen] = useState(false);       // user intent: expanded or not
  const [visible, setVisible] = useState(false); // render expanded content while animating

  const menuIconOpacity = useRef(new Animated.Value(1)).current;
  const menuIconScale = useRef(new Animated.Value(1)).current;
  const [menuIconName, setMenuIconName] = useState<keyof typeof Ionicons.glyphMap>("menu");

  const animateMenuIconTo = useCallback((nextIcon: keyof typeof Ionicons.glyphMap) => {
    Animated.parallel([
      Animated.timing(menuIconOpacity, {
        toValue: 0,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(menuIconScale, {
        toValue: 0.86,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) return;
      setMenuIconName(nextIcon);
      Animated.parallel([
        Animated.timing(menuIconOpacity, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(menuIconScale, {
          toValue: 1,
          damping: 14,
          stiffness: 220,
          mass: 0.8,
          overshootClamping: false,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [menuIconOpacity, menuIconScale]);


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
    animateMenuIconTo("chevron-down");

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
    animateMenuIconTo("menu");

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
    const shellBg = isDark ? "#0a0a0a" : "#F5F7FB";
    const glassFallback = isDark ? "rgba(18,18,18,0.92)" : "rgba(255,255,255,0.88)";
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

    const btnBg = isDark ? "rgba(22,22,22,0.70)" : "rgba(0,0,0,0.05)";
    const btnBgHover = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";

    const activeBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0, 0, 0, 0.05)";
    const activeRing = isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.10)";

    const itemBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
    const divider = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";

    const dangerText = isDark ? "rgba(254,202,202,0.95)" : "#B91C1C";
    const dangerBg = "rgba(239,68,68,0.10)";
    const dangerBorder = "rgba(239,68,68,0.25)";

    return {
      shellBg,
      glassFallback,
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
            { height: sheetH },
          ]}
        >
          <Animated.View style={{ flex: 1, transform: [{ scale: pillScale }, { scaleX: pillScaleX }] }}>
          <GlassSurface
            key={`glass-${resolvedTheme}`}
            isDark={isDark}
            expanded={open}
            fallbackStyle={{
              backgroundColor: TOKENS.glassFallback,
              // borderWidth: StyleSheet.hairlineWidth,
              borderColor: TOKENS.ring,
            }}
          >
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { 
                  // borderWidth: StyleSheet.hairlineWidth,
                   borderColor: TOKENS.ring, borderRadius: PILL_RADIUS },
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
                              // borderWidth: active ? StyleSheet.hairlineWidth : 0,
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

                  {/* User card */}
                  <View style={[styles.userCard, { backgroundColor: TOKENS.btnBg }]}>
                    {/* Avatar */}
                    {user.imageUrl ? (
                      <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarInitial}>
                          {user.name?.charAt(0).toUpperCase() ?? "?"}
                        </Text>
                      </View>
                    )}

                    {/* Name + email */}
                    <View style={styles.userInfo}>
                      <Text style={[styles.userName, { color: TOKENS.textPrimary }]} numberOfLines={1}>
                        {user.name}
                      </Text>
                      <Text style={[styles.userEmail, { color: TOKENS.textMuted }]} numberOfLines={1}>
                        {user.email}
                      </Text>
                    </View>

                    {/* Logout icon */}
                    <Pressable
                      onPress={handleLogout}
                      hitSlop={8}
                      style={({ pressed }) => [
                        styles.logoutIcon,
                        { backgroundColor: pressed ? TOKENS.dangerBg : "transparent" },
                      ]}
                    >
                      <Ionicons name="log-out-outline" size={18} color={TOKENS.dangerText} />
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            )}

            <Animated.View style={styles.row} {...swipePan.panHandlers}>
              {/* Sliding active indicator */}
              <View
                style={styles.tabsContainer}
                onLayout={(e) => {
                  const w = e.nativeEvent.layout.width;
                  tabsAreaWidthRef.current = w;
                  setTabsAreaWidth(w);
                }}
              >
                {tabsAreaWidth > 0 && (
                  <Animated.View
                    style={[
                      styles.tabIndicator,
                      {
                        backgroundColor: TOKENS.activeBg,
                        width: tabsAreaWidth / tabs.length - 6,
                        transform: [{
                          translateX: indicatorAnim.interpolate({
                            inputRange: tabs.map((_, i) => i),
                            outputRange: tabs.map((_, i) => i * (tabsAreaWidth / tabs.length)),
                            extrapolate: "clamp",
                          }),
                        }],
                      },
                    ]}
                  />
                )}

                {tabs.map((it) => {
                  const active = isActive(it.href);
                  return (
                    <Pressable
                      key={it.href}
                      onPress={() => go(it.href)}
                      onPressIn={expandPill}
                      onPressOut={shrinkPill}
                      style={styles.tabBtn}
                    >
                      <Ionicons
                        name={it.icon}
                        size={22}
                        color={active ? TOKENS.textPrimary : TOKENS.textMuted}
                      />
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                onPress={() => (open ? closeSheet() : openSheet())}
                onPressIn={expandPill}
                onPressOut={shrinkPill}
                style={({ pressed }) => [
                  styles.menuBtn,
                  { backgroundColor: pressed ? TOKENS.btnBgHover : TOKENS.btnBg },
                ]}
              >
                <Animated.View
                  style={{
                    opacity: menuIconOpacity,
                    transform: [{ scale: menuIconScale }],
                  }}
                >
                  <Ionicons name={menuIconName} size={22} color={TOKENS.textPrimary} />
                </Animated.View>
              </Pressable>
            </Animated.View>
          </GlassSurface>
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
    width: "80%",
    borderRadius: PILL_RADIUS,
    overflow: "hidden",
    position: "relative",
  },

  glassFill: {
    flex: 1,
    borderRadius: PILL_RADIUS,
    overflow: "hidden",
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
    // borderBottomWidth: StyleSheet.hairlineWidth,
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
    // borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },

  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: "700",
  },
  userEmail: {
    fontSize: 11,
    fontWeight: "500",
  },
  logoutIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

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
  tabsContainer: {
    flex: 1,
    flexDirection: "row",
    position: "relative",
  },
  tabIndicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 3,
    borderRadius: 16,
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