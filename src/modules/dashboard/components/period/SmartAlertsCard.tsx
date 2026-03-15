import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../../context/ThemeContext";

type Severity = "good" | "warn" | "bad";

export type SmartAlert = {
  title: string;
  detail?: string;
  severity: Severity;
};

type Props = {
  alerts?: SmartAlert[];
};

function severityDotColor(sev: Severity) {
  if (sev === "good") return "#10b981";
  if (sev === "warn") return "#f59e0b";
  return "#ef4444";
}

export function SmartAlertsCard({ alerts }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const list = alerts ?? [];

  const ui = useMemo(() => {
    const text = isDark ? "rgba(226,232,240,0.92)" : "rgba(15,23,42,0.92)";
    const sub = isDark ? "rgba(148,163,184,0.82)" : "rgba(100,116,139,0.92)";
    const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";

    const cardGrad = isDark
      ? ["rgba(2,6,23,0.58)", "rgba(15,23,42,0.46)", "rgba(2,6,23,0.38)"]
      : ["rgba(255,255,255,0.78)", "rgba(255,255,255,0.62)", "rgba(255,255,255,0.52)"];

    const innerGrad = isDark
      ? ["rgba(15,23,42,0.35)", "rgba(2,6,23,0.20)"]
      : ["rgba(237,237,237,0.90)", "rgba(255,255,255,0.65)"];

    const tileBg = isDark ? "rgba(15,23,42,0.35)" : "rgba(237,237,237,0.90)";
    const badgeBg = isDark ? "rgba(15,23,42,0.55)" : "rgba(237,237,237,0.95)";

    return { text, sub, border, cardGrad, innerGrad, tileBg, badgeBg };
  }, [isDark]);

  return (
    <View style={[styles.wrap, { borderColor: ui.border }]}>
      <BlurView intensity={isDark ? 26 : 40} tint={isDark ? "dark" : "light"} style={styles.card}>
        <LinearGradient colors={ui.cardGrad as any} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

        <View style={[styles.inner, { borderColor: ui.border }]}>
          <LinearGradient colors={ui.innerGrad as any} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.title, { color: ui.text }]}>Smart alerts</Text>
              <Text style={[styles.subtitle, { color: ui.sub }]} numberOfLines={2}>
                Automated checks across spending and balances.
              </Text>
            </View>

            {list.length ? (
              <View style={[styles.badge, { borderColor: ui.border, backgroundColor: ui.badgeBg }]}>
                <Text style={{ color: ui.text, fontWeight: "700", fontSize: 12 }}>{list.length}</Text>
              </View>
            ) : null}
          </View>

          {/* Body */}
          <View style={styles.body}>
            {list.length ? (
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 4 }}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                {list.map((a, idx) => {
                  const dot = severityDotColor(a.severity);

                  return (
                    <View
                      key={`${a.title}-${idx}`}
                      style={[
                        styles.tile,
                        {
                          borderColor: ui.border,
                          backgroundColor: ui.tileBg,
                        },
                      ]}
                    >
                      <View style={[styles.dot, { backgroundColor: dot }]} />

                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={[styles.alertTitle, { color: ui.text }]} numberOfLines={1}>
                          {a.title}
                        </Text>
                        <Text style={[styles.alertDetail, { color: ui.sub }]} numberOfLines={1}>
                          {a.detail || " "}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={[styles.empty, { color: ui.sub }]}>No alerts right now.</Text>
            )}
          </View>
        </View>
      </BlurView>
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
    height: 420, // matches your stack height vibe. Remove if you want auto height.
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "700",
  },

  badge: {
    borderRadius: 999,
    // borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  body: {
    marginTop: 12,
    flex: 1,
  },

  tile: {
    height: 68,
    borderRadius: 14,
    // borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 6,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  alertDetail: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
  },
  empty: {
    fontSize: 13,
    fontWeight: "700",
  },
});