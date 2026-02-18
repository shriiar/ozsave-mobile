import React, { useEffect, useState } from "react";
import { useSegments, router } from "expo-router";
import { View, Text } from "react-native";
import { useAuth } from "../context/AuthContext";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (loading) return;

    const root = String(segments?.[0] ?? "");
    const inAuthGroup = root === "(auth)";
    const inUserGroup = root === "(user)";
    const atRoot = root === ""; // when route is "/" basically

    // default deny while deciding
    setAllowed(false);

    // Decide where "/" goes
    if (atRoot) {
      if (user) router.replace("/(user)/dashboard" as any);
      else router.replace("/(auth)/login" as any);
      return;
    }

    // Not logged in -> block user routes
    if (!user && inUserGroup) {
      router.replace("/(auth)/login" as any);
      return;
    }

    // Logged in -> block auth routes
    if (user && inAuthGroup) {
      router.replace("/(user)/dashboard" as any);
      return;
    }

    // Otherwise allowed
    setAllowed(true);
  }, [user, loading, segments]);

  if (loading || !allowed) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ opacity: 0.6 }}>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
}