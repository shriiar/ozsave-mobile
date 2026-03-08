// app/_layout.tsx
import "react-native-gesture-handler";

import React from "react";
import { Stack } from "expo-router/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, StyleSheet } from "react-native";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../src/context/AuthContext";
import { ThemeProvider } from "../src/context/ThemeContext";

import ThemeTransitionOverlay from "../src/components/ThemeTransitionOverlay";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10_000,
    },
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <View style={styles.root}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: "fade",
                  gestureEnabled: false,
                  animationDuration: 260,
                }}
              />

              {/* MUST be last so it sits above Stack */}
              <ThemeTransitionOverlay />
            </View>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});