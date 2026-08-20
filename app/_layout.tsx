import "react-native-gesture-handler";

import React, { useEffect, useState } from "react";
import { Stack } from "expo-router/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, StyleSheet } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";

import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../src/context/AuthContext";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";

import ThemeTransitionOverlay from "../src/components/ThemeTransitionOverlay";
import Toast from "react-native-toast-message";
import { createToastConfig } from "../src/components/toastConfig";
import { queryClient, initQueryPersistence } from "../src/lib/queryClient";

SplashScreen.preventAutoHideAsync().catch(() => {});

function AppShell() {
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = useTheme();

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: resolvedTheme === "dark" ? "#0a0a0a" : "#ffffff" }
      ]}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          gestureEnabled: false,
          animationDuration: 260,
          contentStyle: { backgroundColor: resolvedTheme === "dark" ? "#0a0a0a" : "#ffffff" },
        }}
      />

      <Toast config={createToastConfig(resolvedTheme)} topOffset={insets.top + 10} />
    </View>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await initQueryPersistence();
      } finally {
        if (mounted) setReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    // Native splash screen (icon on flat background) stays on top until this
    // resolves — no JS loading UI needed.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <AppShell />
            </AuthProvider>
            <ThemeTransitionOverlay />
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});