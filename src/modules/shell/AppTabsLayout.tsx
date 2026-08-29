// src/modules/shell/AppTabsLayout.tsx
//
// Native iOS tab bar shell — replaces the custom pill nav bar in
// DashboardShell.tsx (kept, unused, for reference/rollback).
// Uses expo-router's NativeTabs, which renders the real native UITabBar —
// on iOS 26 this automatically gets the system's Liquid Glass look with no
// custom styling needed here.
import React, { useEffect, useRef } from "react";
import { DynamicColorIOS } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router, usePathname } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { fireScrollToTop } from "../../lib/scrollToTop";

const ROUTES = {
  home: "/dashboard",
  login: "/(auth)/login",
} as const;

// Tapping the already-active tab should scroll its content back to the top,
// same as the old pill nav bar did. NativeTabs doesn't expose "is this the
// currently focused tab" directly inside a tabPress listener, so we compare
// against the live pathname instead.
const TAB_PATHS = {
  dashboard: "/dashboard",
  cost: "/cost",
  income: "/income",
  billing: "/billing",
  profile: "/profile",
} as const;

export default function AppTabsLayout() {
  const { user, loading } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const pathname = usePathname();

  const hasHouse = !!user?.house;
  const isAdmin = user?.role === "admin";

  // Kept fresh every render so the tabPress listeners below (attached once,
  // not re-created per navigation) always compare against the current route.
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  function scrollToTopIfActive(path: string) {
    return {
      tabPress: () => {
        if (pathnameRef.current === path) fireScrollToTop(path);
      },
    };
  }

  // Same redirect guard DashboardShell used to run: bounce to login if
  // signed out, bounce to dashboard if signed in without a house yet, and
  // block non-admins from reaching /admin/* directly.
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

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} translucent backgroundColor="transparent" />

      <NativeTabs
        blurEffect="systemChromeMaterial"
        iconColor={{
          default: DynamicColorIOS({ light: "#64748B", dark: "#94A3B8" }),
          selected: DynamicColorIOS({ light: "#0F172A", dark: "#FFFFFF" }),
        }}
        // labelStyle no longer needed — labels are hidden below (icon-only tab bar)
        // labelStyle={{
        //   color: DynamicColorIOS({ light: "#0F172A", dark: "#FFFFFF" }),
        // }}
      >
        <NativeTabs.Trigger name="dashboard" listeners={scrollToTopIfActive(TAB_PATHS.dashboard)}>
          <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
          <NativeTabs.Trigger.Label hidden>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="cost" listeners={scrollToTopIfActive(TAB_PATHS.cost)}>
          <NativeTabs.Trigger.Icon sf={{ default: "receipt", selected: "receipt.fill" }} md="receipt_long" />
          <NativeTabs.Trigger.Label hidden>Costs</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="income" listeners={scrollToTopIfActive(TAB_PATHS.income)}>
          <NativeTabs.Trigger.Icon sf={{ default: "wallet.pass", selected: "wallet.pass.fill" }} md="account_balance_wallet" />
          <NativeTabs.Trigger.Label hidden>Income</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="billing" listeners={scrollToTopIfActive(TAB_PATHS.billing)}>
          <NativeTabs.Trigger.Icon sf={{ default: "creditcard", selected: "creditcard.fill" }} md="credit_card" />
          <NativeTabs.Trigger.Label hidden>Billing</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="profile" listeners={scrollToTopIfActive(TAB_PATHS.profile)}>
          <NativeTabs.Trigger.Icon sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }} md="person" />
          <NativeTabs.Trigger.Label hidden>Profile</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </>
  );
}
