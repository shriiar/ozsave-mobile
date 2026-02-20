// src/modules/dashboard/components/DashboardWithHouse.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { router } from "expo-router";

export default function DashboardWithHouse({
  house,
  period,
  balances,
  error,
}: {
  house: { _id: string; name: string };
  period: any | null;
  balances: any | null;
  error: string | null;
}) {
  const { logout, user } = useAuth();

  async function onLogout() {
    await logout();
    router.replace("/(auth)/login");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <Text style={styles.sub}>
        House: {house.name} ({house._id})
      </Text>

      <Text style={styles.sub}>User: {user?.email ?? "Unknown"}</Text>

      {error ? <Text style={styles.err}>{error}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Period data</Text>
        <Text style={styles.mono}>{period ? JSON.stringify(period.summary, null, 2) : "No period data"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Balances</Text>
        <Text style={styles.mono}>{balances ? JSON.stringify(balances.totals, null, 2) : "No balances"}</Text>
      </View>

      <Pressable onPress={onLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 28 },
  title: { fontSize: 22, fontWeight: "700" },
  sub: { marginTop: 6, opacity: 0.7 },
  err: { marginTop: 10, color: "#DC2626", fontWeight: "600" },

  card: {
    marginTop: 14,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  cardTitle: { fontWeight: "700", marginBottom: 8 },
  mono: { fontFamily: "Menlo", fontSize: 12, opacity: 0.85 },

  logoutBtn: {
    marginTop: 18,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#111827",
  },
  logoutText: { color: "white", fontWeight: "700" },
});