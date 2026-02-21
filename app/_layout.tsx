// app/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../src/context/AuthContext";
import { ThemeProvider } from "../src/context/ThemeContext";

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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Stack screenOptions={{
            headerShown: false, // ✅ kill the “slides from right”
            animation: "none",

            // extra safety
            gestureEnabled: false,
          }} />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}