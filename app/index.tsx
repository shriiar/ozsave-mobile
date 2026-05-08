// app/index.tsx
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../src/context/AuthContext";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#050814" }}>
        <ActivityIndicator color="#818CF8" />
      </View>
    );
  }

  return <Redirect href={user ? "/(user)/dashboard" : "/(auth)/login"} />;
}