// src/modules/dashboard/components/GetStarted.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useAuth } from "../../../context/AuthContext";

export default function GetStarted() {
  const { user, refreshUser } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to OzSave</Text>
      <Text style={styles.sub}>No house found for {user?.email}.</Text>

      <Pressable onPress={refreshUser} style={styles.btn}>
        <Text style={styles.btnText}>Refresh</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 28 },
  title: { fontSize: 22, fontWeight: "700" },
  sub: { marginTop: 8, opacity: 0.7 },
  btn: {
    marginTop: 18,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#4F46E5",
  },
  btnText: { color: "white", fontWeight: "700" },
});