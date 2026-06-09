import { Redirect } from "expo-router";
import { View, ActivityIndicator, useColorScheme } from "react-native";
import { useAuth } from "../src/context/AuthContext";

export default function Index() {
  const { user, loading } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "#0a0a0a" : "#F5F7FB" }}>
        <ActivityIndicator color={isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.4)"} />
      </View>
    );
  }

  return <Redirect href={user ? "/(user)/dashboard" : "/(auth)/login"} />;
}