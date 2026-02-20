// app/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../src/context/AuthContext";
import { ThemeProvider } from "../src/context/ThemeContext";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}