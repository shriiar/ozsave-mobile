import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../../context/ThemeContext";
import type { PeriodDashboard } from "./types";
import { severityTone } from "./formatters";

type Props = {
  insights?: PeriodDashboard["insights"];
};

export function InsightsGridCard({ insights }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const list = insights ?? [];

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

    const tileBg = isDark ? "rgba(15,23,42,0.70)" : "rgba(237,237,237,0.95)";

    return { text, sub, border, cardGrad, innerGrad, tileBg };
  }, [isDark]);

  return (
    <View style={[styles.wrap, { borderColor: ui.border }]}>
      <BlurView intensity={isDark ? 26 : 40} tint={isDark ? "dark" : "light"} style={styles.card}>
        <LinearGradient
          colors={ui.cardGrad as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={[styles.inner, { borderColor: ui.border }]}>
          <LinearGradient
            colors={ui.innerGrad as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* HEADER */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: ui.text }]}>Insights</Text>
              <Text style={[styles.subtitle, { color: ui.sub }]}>
                Quick takeaways.
              </Text>
            </View>

            {list.length ? (
              <View style={[styles.badge, { borderColor: ui.border, backgroundColor: ui.tileBg }]}>
                <Text style={{ color: ui.text, fontWeight: "700", fontSize: 11 }}>
                  {list.length}
                </Text>
              </View>
            ) : null}
          </View>

          {/* BODY */}
          <View style={{ flex: 1, marginTop: 10 }}>
            {list.length ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {list.map((ins, idx) => {
                  const { dotColor } = severityTone(ins.severity);

                  return (
                    <View
                      key={`${ins.title}-${idx}`}
                      style={[
                        styles.tile,
                        {
                          borderColor: ui.border,
                          backgroundColor: ui.tileBg,
                        },
                      ]}
                    >
                      <View style={[styles.dot, { backgroundColor: dotColor }]} />

                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text
                          numberOfLines={1}
                          style={[styles.tileTitle, { color: ui.text }]}
                        >
                          {ins.title}
                        </Text>

                        <Text
                          numberOfLines={1}
                          style={[styles.tileSub, { color: ui.sub }]}
                        >
                          {ins.detail || ins.subtitle || " "}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={{ color: ui.sub, fontWeight: "700", fontSize: 13 }}>
                No insights yet.
              </Text>
            )}
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    borderRadius: 18,
    overflow: "hidden",
    // borderWidth: StyleSheet.hairlineWidth,
  },

  card: {
    flex: 1,
    borderRadius: 18,
    overflow: "hidden",
  },

  inner: {
    flex: 1,
    borderRadius: 16,
    // borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  title: {
    fontSize: 14,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },

  badge: {
    borderRadius: 999,
    // borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  tile: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    // borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
    minHeight: 60,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 6,
    marginRight: 10,
  },

  tileTitle: {
    fontSize: 13,
    fontWeight: "700",
  },

  tileSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
  },
});