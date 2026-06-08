import React, { useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { PieChart } from "react-native-gifted-charts";
import { useTheme } from "../../../../context/ThemeContext";

const PIE_COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6"];

function money(n: number) {
  const v = Number(n ?? 0);
  if (!Number.isFinite(v)) return "$0";
  return `$${Math.round(v).toLocaleString()}`;
}

function titleizeCategory(raw: string) {
    const s = String(raw ?? "").trim();
    if (!s) return "";
  
    // turn underscores/hyphens into spaces, collapse multiple spaces
    const spaced = s.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  
    // Title Case each word
    return spaced
      .split(" ")
      .map((w) => {
        const lower = w.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      })
      .join(" ");
  }

export type CategoryPieItem = {
  category: string;
  amount: number;
  percent: number;
};

export type CategoryInsights = {
  headline?: string;
  top3?: Array<{
    category: string;
    current: number;
    delta?: number;
    currentSharePct?: number;
  }>;
};

type Props = {
  pie: CategoryPieItem[];
  categoryInsights?: CategoryInsights;
};

export function CategorySectionCard(props: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const ui = useMemo(() => {
    const text = isDark ? "rgba(226,232,240,0.92)" : "rgba(15,23,42,0.92)";
    const sub = isDark ? "rgba(148,163,184,0.80)" : "rgba(15,23,42,0.70)";
    const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";

    const cardGrad = isDark
      ? ["rgba(5,5,5,0.58)", "rgba(18,18,18,0.46)", "rgba(5,5,5,0.38)"]
      : ["rgba(255,255,255,0.78)", "rgba(255,255,255,0.62)", "rgba(255,255,255,0.52)"];

    const innerGrad = isDark
      ? ["rgba(22,22,22,0.55)", "rgba(12,12,12,0.40)"]
      : ["rgba(237,237,237,0.90)", "rgba(255,255,255,0.65)"];

    const tileBg = isDark ? "rgba(22,22,22,0.60)" : "rgba(237,237,237,0.90)";

    return { text, sub, border, cardGrad, innerGrad, tileBg };
  }, [isDark]);

  const pie = useMemo(() => (props.pie ?? []).slice(0, 7), [props.pie]);
  const hasData = pie.length > 0;

  const top3 = props.categoryInsights?.top3 ?? [];
  const hasTop3 = top3.length > 0;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const closeTooltip = useCallback(() => setSelectedIndex(null), []);

  const pieData = useMemo(() => {
    return pie.map((p, i) => ({
      value: Number(p.amount ?? 0),
      text: `${Math.round(Number(p.percent ?? 0))}%`,
      color: PIE_COLORS[i % PIE_COLORS.length],
      category: p.category,
      amount: Number(p.amount ?? 0),
      percent: Number(p.percent ?? 0),
      onPress: () => setSelectedIndex(i),
    }));
  }, [pie]);

  const selected = selectedIndex == null ? null : pieData[selectedIndex];

  return (
    <View style={[styles.wrap, { borderColor: ui.border }]}>
      <BlurView intensity={isDark ? 26 : 40} tint={isDark ? "dark" : "light"} style={styles.card}>
        <LinearGradient colors={ui.cardGrad as any} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

        <View style={[styles.inner, { borderColor: ui.border }]}>
          <LinearGradient colors={ui.innerGrad as any} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

          {/* tap anywhere closes tooltip */}
          <Pressable style={StyleSheet.absoluteFill} onPress={closeTooltip} />

          <View style={{ paddingHorizontal: 12, paddingTop: 10 }}>
            <Text style={{ color: ui.text, fontWeight: "700", fontSize: 14 }}>Expense breakdown</Text>
            <Text style={{ color: ui.sub, fontWeight: "600", fontSize: 13, marginTop: 6 }} numberOfLines={2}>
              {props.categoryInsights?.headline ?? "Top categories for this period."}
            </Text>
          </View>

          {hasData ? (
            <View style={{ marginTop: 10 }}>
              {/* Donut + tooltip */}
              <View style={styles.donutRow}>
                <View style={[styles.donutPanel, { borderColor: ui.border }]}>
                  <PieChart
                    data={pieData as any}
                    donut
                    radius={78}
                    innerRadius={50}
                    strokeWidth={0}
                    innerCircleColor={"transparent"}
                    // showText
                    textColor={ui.text}
                    textSize={10}
                  />
                </View>

                {selected ? (
                  <View
                    pointerEvents="none"
                    style={[
                      styles.tooltip,
                      {
                        borderColor: ui.border,
                        backgroundColor: isDark ? "rgba(5,5,5,0.94)" : "rgba(255,255,255,0.98)",
                      },
                    ]}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={{ height: 10, width: 10, borderRadius: 6, backgroundColor: selected.color }} />
                      <Text style={{ color: ui.text, fontWeight: "700", fontSize: 12 }} numberOfLines={1}>
                      {titleizeCategory(selected.category)}
                      </Text>
                    </View>

                    <View style={{ height: 8 }} />

                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ color: ui.sub, fontWeight: "700", fontSize: 12 }}>Amount</Text>
                      <Text style={{ color: ui.text, fontWeight: "700", fontSize: 12 }}>{money(selected.amount)}</Text>
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
                      <Text style={{ color: ui.sub, fontWeight: "700", fontSize: 12 }}>Share</Text>
                      <Text style={{ color: ui.text, fontWeight: "700", fontSize: 12 }}>{selected.percent}%</Text>
                    </View>
                  </View>
                ) : null}
              </View>

              {/* Legend list */}
              <View style={{ paddingHorizontal: 12, marginTop: 10 }}>
                <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
                  {pie.map((c, i) => {
                    const color = PIE_COLORS[i % PIE_COLORS.length];
                    const active = selectedIndex === i;

                    return (
                      <Pressable
                        key={c.category}
                        onPress={() => setSelectedIndex(i)}
                        style={[
                          styles.tile,
                          { borderColor: ui.border, backgroundColor: ui.tileBg, opacity: active ? 1 : 0.92 },
                        ]}
                      >
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                          <View style={{ height: 10, width: 10, borderRadius: 6, backgroundColor: color }} />
                          <Text style={{ color: ui.text, fontWeight: "700", fontSize: 13 }} numberOfLines={1}>
                          {titleizeCategory(c.category)}
                          </Text>
                        </View>

                        <View style={{ alignItems: "flex-end" }}>
                          <Text style={{ color: ui.text, fontWeight: "700", fontSize: 13 }}>{money(c.amount)}</Text>
                          <Text style={{ color: ui.sub, fontWeight: "700", fontSize: 12 }}>{c.percent}%</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Top 3 */}
              {hasTop3 ? (
                <View style={{ paddingHorizontal: 12, marginTop: 12, paddingBottom: 12 }}>
                  <View style={[styles.top3Box, { borderColor: ui.border, backgroundColor: ui.tileBg }]}>
                    <Text style={{ color: ui.text, fontWeight: "700", fontSize: 13, marginBottom: 10 }}>
                      Top 3 vs previous
                    </Text>

                    <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
                      {top3.map((r, idx) => {
                        const delta = Number(r.delta ?? 0);
                        const up = delta > 0;
                        const down = delta < 0;

                        const deltaText = !up && !down ? "No change" : `${up ? "▲" : "▼"} ${money(Math.abs(delta))}`;
                        const deltaColor = !up && !down ? ui.sub : up ? "#ef4444" : "#10b981";

                        return (
                          <View key={`${r.category}-${idx}`} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 }}>
                            <View style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
                              <Text style={{ color: ui.text, fontWeight: "700", fontSize: 13 }} numberOfLines={1}>
                              {titleizeCategory(r.category)}
                              </Text>
                              <Text style={{ color: ui.sub, fontWeight: "700", fontSize: 12 }}>
                                Share {Number(r.currentSharePct ?? 0).toFixed(1)}%
                              </Text>
                            </View>

                            <View style={{ alignItems: "flex-end" }}>
                              <Text style={{ color: ui.text, fontWeight: "700", fontSize: 13 }}>{money(r.current)}</Text>
                              <Text style={{ color: deltaColor, fontWeight: "700", fontSize: 12 }}>{deltaText}</Text>
                            </View>
                          </View>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>
              ) : (
                <View style={{ paddingBottom: 12 }} />
              )}
            </View>
          ) : (
            <View style={{ paddingHorizontal: 12, paddingTop: 14, paddingBottom: 14 }}>
              <Text style={{ color: ui.sub, fontWeight: "700", fontSize: 13 }}>
                No category data available for this period.
              </Text>
            </View>
          )}
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
    overflow: "hidden",
    paddingBottom: 2,
  },
  donutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
  },
  donutPanel: {
    height: 160,
    width: 160,
    borderRadius: 16,
    // borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  tooltip: {
    flex: 1,
    borderRadius: 14,
    // borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxWidth: 220,
  },
  tile: {
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
  top3Box: {
    borderRadius: 14,
    // borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
});