import { Stack } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";

export default function AuthLayout() {
  const { resolvedTheme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        gestureEnabled: false,
        animationDuration: 220,
        contentStyle: { backgroundColor: resolvedTheme === "dark" ? "#0a0a0a" : "#ffffff" },
      }}
    />
  );
}