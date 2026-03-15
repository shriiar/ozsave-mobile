import "react-native-gesture-handler";

import React, { useEffect, useState } from "react";
import { Stack } from "expo-router/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../src/context/AuthContext";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";

import ThemeTransitionOverlay from "../src/components/ThemeTransitionOverlay";
import Toast from "react-native-toast-message";
import { createToastConfig } from "../src/components/toastConfig";
import { queryClient, initQueryPersistence } from "../src/lib/queryClient";

function AppShell() {
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = useTheme();

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: resolvedTheme === "dark" ? "#020617" : "#ffffff" }
      ]}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          gestureEnabled: false,
          animationDuration: 260,
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
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.loader}>
          <ActivityIndicator />
        </View>
      </GestureHandlerRootView>
    );
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
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
});