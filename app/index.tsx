import { useEffect } from "react";
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useAuth } from "../src/context/AuthContext";

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loading]);

  if (loading) {
    // Native splash screen stays on top until we know where to route.
    return null;
  }

  return <Redirect href={user ? "/(user)/dashboard" : "/(auth)/login"} />;
}