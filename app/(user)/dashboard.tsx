import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { router } from "expo-router";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    if (busy) return;
    setBusy(true);
    try {
      await logout();
      router.replace("/(auth)/login");
    } catch (e: any) {
      Alert.alert("Logout failed", e?.message ?? "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.sub}>User: {user?.email ?? "Unknown"}</Text>

      <Pressable
        disabled={busy}
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.btn,
          busy && styles.btnDisabled,
          pressed && !busy ? styles.btnPressed : null,
        ]}
      >
        <Text style={styles.btnText}>{busy ? "Logging out..." : "Logout"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700" },
  sub: { marginTop: 8, fontSize: 13, opacity: 0.7 },
  btn: {
    marginTop: 18,
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 18,
  },
  btnPressed: { transform: [{ scale: 0.97 }] },
  btnDisabled: { opacity: 0.55 },
  btnText: { color: "#fff", fontWeight: "700" },
});