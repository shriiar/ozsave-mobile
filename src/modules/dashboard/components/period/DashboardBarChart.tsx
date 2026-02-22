import React, { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { BarChart } from "react-native-gifted-charts";
import { useTheme } from "../../../../context/ThemeContext";

export type BarPoint = {
  dayKey: string; // YYYY-MM-DD
  dayLabel: string; // unused
  cost: number;
  manual: number;
  estimate: number;
};

function formatAxisMoney(v: number) {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n)) return "0";
  if (Math.abs(n) >= 1_000_000) return `${Math.round(n / 1_000_000)}M`;
  if (Math.abs(n) >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${Math.round(n)}`;
}

// "2026-02-16" -> "16 Feb"
function formatDayShort(ymd: string) {
  const [yy, mm, dd] = (ymd || "").split("-").map(Number);
  if (!yy || !mm || !dd) return ymd || "";
  const dt = new Date(yy, mm - 1, dd);
  const day = dt.toLocaleDateString(undefined, { day: "2-digit" });
  const mon = dt.toLocaleDateString(undefined, { month: "short" });
  return `${day} ${mon}`;
}

export function DashboardBarChart({ data }: { data: BarPoint[] }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const ui = useMemo(() => {
    const axis = isDark ? "rgba(148,163,184,0.92)" : "rgba(15,23,42,0.92)";
    const grid = isDark ? "rgba(148,163,184,0.18)" : "rgba(15,23,42,0.16)";
    const legend = isDark ? "rgba(226,232,240,0.92)" : "rgba(15,23,42,0.92)";

    const cardGrad = isDark
      ? ["rgba(2,6,23,0.58)", "rgba(15,23,42,0.46)", "rgba(2,6,23,0.38)"]
      : ["rgba(255,255,255,0.78)", "rgba(255,255,255,0.62)", "rgba(255,255,255,0.52)"];

    const innerGrad = isDark
      ? ["rgba(15,23,42,0.35)", "rgba(2,6,23,0.20)"]
      : ["rgba(237,237,237,0.90)", "rgba(255,255,255,0.65)"];

    const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";

    return {
      axis,
      grid,
      legend,
      border,
      cardGrad,
      innerGrad,
      cost: "#ef4444",
      manual: "#10b981",
      estimate: "#f59e0b",
    };
  }, [isDark]);

  const safe = Array.isArray(data) ? data : [];

  // scale
  const maxY = useMemo(() => {
    let m = 0;
    for (const d of safe) {
      m = Math.max(m, Number(d.cost ?? 0), Number(d.manual ?? 0), Number(d.estimate ?? 0));
    }
    return m <= 0 ? 10 : m;
  }, [safe]);

  // ----- Chart sizing constants (keep consistent everywhere) -----
  const BAR_W = 12;
  const SPACING = 10;
  const INITIAL_SPACING = 10;
  
  const Y_AXIS_LABEL_W = 48;        // must match yAxisLabelWidth
  const CHARTBOX_PAD_H = 6;         // must match styles.chartBox paddingHorizontal
  
  const LABEL_ROW_PAD_LEFT =
    CHARTBOX_PAD_H + Y_AXIS_LABEL_W + INITIAL_SPACING + (BAR_W + SPACING); // center under 3-bar group
  const GROUP_W = (BAR_W + SPACING) * 3; // 3 bars/day

  const screenW = Dimensions.get("window").width;
  const cardInnerW = Math.max(0, screenW - 16 * 2); // rough, we still clamp later

  // chart visible width (inside paddings)
  const chartW = Math.max(0, screenW - 16 * 2 - 12 * 2 - 6 * 2);

  // content width = enough for all days; if small data, at least chartW
  const chartContentW = useMemo(() => {
    const groups = safe.length;
    const w = INITIAL_SPACING + groups * GROUP_W + 24; // some tail space
    return Math.max(chartW, w);
  }, [safe.length, chartW]);

  // ✅ GROUPED bars (3 per day), BUT no x-axis labels from library
  // We will render our own label row below, centered per day group.
  const chartData = useMemo(() => {
    const out: any[] = [];
    for (const d of safe) {
      const cost = Number(d.cost ?? 0);
      const manual = Number(d.manual ?? 0);
      const estimate = Number(d.estimate ?? 0);

      out.push({
        value: cost,
        frontColor: ui.cost,
        meta: { dayKey: d.dayKey, cost, manual, estimate },
      });
      out.push({
        value: manual,
        frontColor: ui.manual,
        meta: { dayKey: d.dayKey, cost, manual, estimate },
      });
      out.push({
        value: estimate,
        frontColor: ui.estimate,
        meta: { dayKey: d.dayKey, cost, manual, estimate },
      });
    }
    return out;
  }, [safe, ui.cost, ui.manual, ui.estimate]);

  // ✅ show every Nth label to avoid clutter
  const labelStep = useMemo(() => {
    const n = safe.length;
    if (n <= 7) return 1;
    if (n <= 14) return 2;
    if (n <= 30) return 3;
    return 4;
  }, [safe.length]);

  return (
    <View style={[styles.wrap, { borderColor: ui.border }]}>
      <BlurView intensity={isDark ? 26 : 40} tint={isDark ? "dark" : "light"} style={styles.card}>
        <LinearGradient colors={ui.cardGrad as any} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

        {/* IMPORTANT: don't clip tooltips */}
        <View style={[styles.inner, { borderColor: ui.border }]}>
          <LinearGradient colors={ui.innerGrad as any} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

          {/* Legend */}
          <View style={styles.legendRow}>
            <LegendPill label="Cost" color={ui.cost} textColor={ui.legend} />
            <LegendPill label="Manual" color={ui.manual} textColor={ui.legend} />
            <LegendPill label="Estimate" color={ui.estimate} textColor={ui.legend} />
          </View>

          {/* Horizontal scroll ONLY for the chart area */}
          <View style={styles.chartBox}>
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ width: chartContentW }}
            >
              <View style={{ width: chartContentW }}>
                <BarChart
                  width={chartContentW}
                  height={320}
                  data={chartData}
                  barWidth={BAR_W}
                  spacing={SPACING}
                  initialSpacing={INITIAL_SPACING}
                  roundedTop

                  // ✅ this is the KEY: disable GiftedCharts internal scroll
                  disableScroll

                  // axes + grid
                  yAxisThickness={0}
                  xAxisThickness={1}
                  xAxisColor={ui.grid}
                  yAxisTextStyle={{ color: ui.axis, fontSize: 11, fontWeight: "600" as any }}
                  rulesType="dashed"
                  rulesColor={ui.grid}
                  noOfSections={4}
                  maxValue={maxY * 1.15}
                  yAxisLabelWidth={48}
                  formatYLabel={(v) => formatAxisMoney(Number(v))}

                  // hide library x labels completely
                  xAxisLabelsHeight={0}

                  renderTooltip={(item: any) => {
                    const meta = item?.meta;
                    if (!meta) return null;

                    return (
                      <View
                        style={[
                          styles.tooltip,
                          {
                            borderColor: ui.border,
                            backgroundColor: isDark ? "rgba(2,6,23,0.94)" : "rgba(255,255,255,0.98)",
                          },
                        ]}
                      >
                        <Text style={{ color: ui.legend, fontWeight: "900", fontSize: 12 }}>
                          {formatDayShort(meta.dayKey)}
                        </Text>

                        <View style={{ height: 8 }} />
                        <TooltipRow label="Cost" color={ui.cost} value={meta.cost} textColor={ui.legend} />
                        <TooltipRow label="Manual" color={ui.manual} value={meta.manual} textColor={ui.legend} />
                        <TooltipRow label="Estimate" color={ui.estimate} value={meta.estimate} textColor={ui.legend} />
                      </View>
                    );
                  }}
                />

                {/* ✅ OUR OWN X LABEL ROW (below bars, centered per day group) */}
                <View style={[styles.xLabelsRow, { paddingLeft: INITIAL_SPACING + BAR_W + SPACING + 20 }]}>
                  {safe.map((d, idx) => {
                    const show = idx % labelStep === 0;
                    return (
                      <View key={d.dayKey} style={{ width: GROUP_W, alignItems: "center" }}>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.xLabel,
                            {
                              color: ui.axis,
                              opacity: show ? 1 : 0,
                            },
                          ]}
                        >
                          {show ? formatDayShort(d.dayKey) : " "}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

function TooltipRow(props: { label: string; color: string; value: number; textColor: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ height: 9, width: 9, borderRadius: 5, backgroundColor: props.color }} />
        <Text style={{ color: props.textColor, fontWeight: "800", fontSize: 12 }}>{props.label}</Text>
      </View>
      <Text style={{ color: props.textColor, fontWeight: "900", fontSize: 12 }}>${Math.round(props.value)}</Text>
    </View>
  );
}

function LegendPill({ label, color, textColor }: { label: string; color: string; textColor: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: color }} />
      <Text style={{ color: textColor, fontWeight: "700", fontSize: 12 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  card: {
    borderRadius: 18,
    overflow: "hidden",
  },

  // no overflow hidden so tooltip not clipped
  inner: {
    margin: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    paddingBottom: 12,
    overflow: "visible",
  },

  legendRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 6,
    alignItems: "center",
    flexWrap: "wrap",
  },

  chartBox: {
    width: "100%",
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 10,
  },

  // our label row under the chart
  xLabelsRow: {
    flexDirection: "row",
    marginTop: 6,
  },
  xLabel: {
    fontSize: 12,
    fontWeight: "700",
  },

  tooltip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: 220,
  },
});