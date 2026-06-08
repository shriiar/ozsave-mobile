import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../../context/ThemeContext";
import { useAuth } from "../../../../context/AuthContext";
import { useDashboardBalances } from "../../hooks/hook"

type HouseMember = {
  _id: string;
  name: string;
  email: string;
};

type House = {
  _id: string;
  name: string;
  members?: HouseMember[];
};

type Props = { house: House };

function money(v: number) {
  const n = Number(v ?? 0);
  return `$${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
}

function initials(name?: string) {
  return (name ?? "?")
    .trim()
    .split(/\s+/g)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function DashboardBalancesCard({ house }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { user } = useAuth();
  const meId = (user as any)?._id;

  const { data } = useDashboardBalances();

  const ui = useMemo(() => {
    const text = isDark ? "rgba(226,232,240,0.92)" : "rgba(15,23,42,0.92)";
    const sub = isDark ? "rgba(148,163,184,0.78)" : "rgba(100,116,139,0.92)";
    const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";

    const cardGrad = isDark
      ? ["rgba(5,5,5,0.58)", "rgba(18,18,18,0.46)", "rgba(5,5,5,0.38)"]
      : ["rgba(255,255,255,0.78)", "rgba(255,255,255,0.62)", "rgba(255,255,255,0.52)"];

    const innerGrad = isDark
      ? ["rgba(22,22,22,0.55)", "rgba(12,12,12,0.40)"]
      : ["rgba(237,237,237,0.90)", "rgba(255,255,255,0.65)"];

    const tileBg = isDark ? "rgba(22,22,22,0.60)" : "rgba(237,237,237,0.95)";
    const avatarBg = isDark ? "rgba(30,41,59,0.55)" : "rgba(237,237,237,0.98)";

    return { text, sub, border, cardGrad, innerGrad, tileBg, avatarBg };
  }, [isDark]);

  const memberMap = useMemo(() => {
    const m = new Map<string, HouseMember>();
    (house.members ?? []).forEach((x) => m.set(x._id, x));
    return m;
  }, [house.members]);

  const view = useMemo(() => {
    if (!data) return { youOwe: [] as any[], owedToYou: [] as any[] };
    const sort = (a: any, b: any) => Number(b.amount ?? 0) - Number(a.amount ?? 0);
    return {
      youOwe: [...(data.youOwe ?? [])].sort(sort),
      owedToYou: [...(data.owedToYou ?? [])].sort(sort),
    };
  }, [data]);

  if (!meId) return null;

  return (
    <View style={{ gap: 12 }}>
      {/* YOU OWE */}
      <View style={[styles.wrap, { borderColor: ui.border }]}>
        <BlurView intensity={isDark ? 26 : 40} tint={isDark ? "dark" : "light"} style={styles.card}>
          <LinearGradient colors={ui.cardGrad as any} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

          <View style={[styles.inner, { borderColor: ui.border }]}>
            <LinearGradient colors={ui.innerGrad as any} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

            <Text style={[styles.title, { color: ui.text }]}>You owe</Text>

            <ScrollView style={{ maxHeight: 184 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 10 }}>
              {view.youOwe.length === 0 ? (
                <Text style={[styles.empty, { color: ui.sub }]}>Nothing. Good.</Text>
              ) : (
                view.youOwe.map((row) => {
                  const m = memberMap.get(row.userId);
                  return (
                    <View key={row.userId} style={[styles.row, { borderColor: ui.border, backgroundColor: ui.tileBg }]}>
                      <View style={styles.left}>
                        <View style={[styles.avatar, { borderColor: ui.border, backgroundColor: ui.avatarBg }]}>
                          <Text style={[styles.avatarText, { color: ui.text }]}>{initials(m?.name)}</Text>
                        </View>

                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={[styles.name, { color: ui.text }]} numberOfLines={1}>
                            {m?.name ?? "Unknown"}
                          </Text>
                          <Text style={[styles.email, { color: ui.sub }]} numberOfLines={1}>
                            {m?.email ?? ""}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.right}>
                        <Text style={[styles.amount, { color: isDark ? "#ff6b6b" : "#b91c1c" }]} numberOfLines={1}>
                          {money(row.amount)}
                        </Text>

                        {/* If you later re-enable Settle, put a Pressable here */}
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </BlurView>
      </View>

      {/* OWED TO YOU */}
      <View style={[styles.wrap, { borderColor: ui.border }]}>
        <BlurView intensity={isDark ? 26 : 40} tint={isDark ? "dark" : "light"} style={styles.card}>
          <LinearGradient colors={ui.cardGrad as any} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

          <View style={[styles.inner, { borderColor: ui.border }]}>
            <LinearGradient colors={ui.innerGrad as any} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

            <Text style={[styles.title, { color: ui.text }]}>Owed to you</Text>

            <ScrollView style={{ maxHeight: 184 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 10 }}>
              {view.owedToYou.length === 0 ? (
                <Text style={[styles.empty, { color: ui.sub }]}>No one owes you.</Text>
              ) : (
                view.owedToYou.map((row) => {
                  const m = memberMap.get(row.userId);
                  return (
                    <View key={row.userId} style={[styles.row, { borderColor: ui.border, backgroundColor: ui.tileBg }]}>
                      <View style={styles.left}>
                        <View style={[styles.avatar, { borderColor: ui.border, backgroundColor: ui.avatarBg }]}>
                          <Text style={[styles.avatarText, { color: ui.text }]}>{initials(m?.name)}</Text>
                        </View>

                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={[styles.name, { color: ui.text }]} numberOfLines={1}>
                            {m?.name ?? "Unknown"}
                          </Text>
                          <Text style={[styles.email, { color: ui.sub }]} numberOfLines={1}>
                            {m?.email ?? ""}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.right}>
                        <Text style={[styles.amount, { color: isDark ? "#34d399" : "#047857" }]} numberOfLines={1}>
                          {money(row.amount)}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 18,
    overflow: "hidden",
    // borderWidth: StyleSheet.hairlineWidth,
  },
  card: {
    borderRadius: 18,
    overflow: "hidden",
  },
  inner: {
    borderRadius: 16,
    // borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    overflow: "hidden",
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
  },
  empty: {
    fontSize: 13,
    fontWeight: "700",
    paddingVertical: 4,
  },
  row: {
    borderRadius: 14,
    // borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  right: {
    alignItems: "flex-end",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatar: {
    height: 36,
    width: 36,
    borderRadius: 18,
    // borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
  },
  name: {
    fontSize: 13,
    fontWeight: "800",
  },
  email: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  amount: {
    fontSize: 13,
    fontWeight: "700",
  },
});