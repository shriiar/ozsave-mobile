// src/modules/dashboard/components/DashboardSkeleton.tsx
import React from "react";
import { View, StyleSheet } from "react-native";

export default function DashboardSkeleton() {
  return (
    <View style={styles.container}>
      <View style={[styles.block, { height: 22, width: 160 }]} />
      <View style={[styles.block, { height: 14, width: 240, marginTop: 10 }]} />

      <View style={[styles.card, { marginTop: 20 }]} />
      <View style={[styles.card, { marginTop: 12 }]} />
      <View style={[styles.card, { marginTop: 12 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 28 },
  block: { borderRadius: 10, backgroundColor: "rgba(0,0,0,0.08)" },
  card: {
    height: 110,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
});