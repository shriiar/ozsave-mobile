import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../../context/ThemeContext";

type Summary = {
  cost: number;
  income: { manual: number; estimate: number };
  netConfirmed: number;
  netProjected: number;
};

type Comparison = {
  prev: {
    cost: number;
    income: { manual: number; estimate: number };
    netConfirmed: number;
    netProjected: number;
  };
  delta: {
    cost: number;
    manual: number;
    estimate: number;
    netConfirmed: number;
    netProjected: number;
  };
  deltaPct: {
    cost: number | null;
    manual: number | null;
    estimate: number | null;
    netConfirmed: number | null;
    netProjected: number | null;
  };
};

type Props = {
  rangeLabel: string; // e.g. "Last 7 days"
  summary: Summary;
  comparison?: Comparison;
};

function money(n: number) {
  const v = Number(n ?? 0);
  if (!Number.isFinite(v)) return "$0.00";
  return `$${v.toFixed(2)}`;
}

function TrendRow(props: {
  label: string;
  value: number;
  delta: number;
  pct: number | null;
  goodWhenDown: boolean;
  ui: {
    text: string;
    sub: string;
    border: string;
    tileBg: string;
    good: string;
    bad: string;
    neutral: string;
  };
}) {
  const up = props.delta > 0;
  const down = props.delta < 0;
  const changed = up || down;

  const good = (props.goodWhenDown && down) || (!props.goodWhenDown && up);

  const deltaColor = !changed ? props.ui.neutral : good ? props.ui.good : props.ui.bad;
  const arrow = !changed ? "" : up ? "▲" : "▼";

  return (
    <View style={[styles.tile, { borderColor: props.ui.border, backgroundColor: props.ui.tileBg }]}>
      <View style={styles.rowTop}>
        <Text style={[styles.label, { color: props.ui.sub }]}>{props.label}</Text>
        <Text style={[styles.value, { color: props.ui.text }]}>{money(props.value)}</Text>
      </View>

      <View style={styles.rowBottom}>
        <Text style={[styles.delta, { color: deltaColor }]}>
          {!changed ? "No change" : `${arrow} ${money(Math.abs(props.delta))}`}
        </Text>

        <Text style={[styles.pct, { color: props.ui.sub }]}>
          {props.pct === null ? "—" : `${up ? "+" : ""}${props.pct}%`}
        </Text>
      </View>
    </View>
  );
}

export function TrendVsPreviousCard({ rangeLabel, summary, comparison }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const ui = useMemo(() => {
    const text = isDark ? "rgba(226,232,240,0.92)" : "rgba(15,23,42,0.92)";
    const sub = isDark ? "rgba(148,163,184,0.82)" : "rgba(100,116,139,0.92)";
    const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";

    const cardGrad = isDark
      ? ["rgba(5,5,5,0.58)", "rgba(18,18,18,0.46)", "rgba(5,5,5,0.38)"]
      : ["rgba(255,255,255,0.78)", "rgba(255,255,255,0.62)", "rgba(255,255,255,0.52)"];

    const innerGrad = isDark
      ? ["rgba(22,22,22,0.55)", "rgba(12,12,12,0.40)"]
      : ["rgba(237,237,237,0.90)", "rgba(255,255,255,0.65)"];

    const tileBg = isDark ? "rgba(22,22,22,0.60)" : "rgba(237,237,237,0.92)";

    return {
      text,
      sub,
      border,
      cardGrad,
      innerGrad,
      tileBg,
      good: isDark ? "#86efac" : "#15803d",
      bad: isDark ? "#fca5a5" : "#b91c1c",
      neutral: isDark ? "rgba(148,163,184,0.82)" : "rgba(100,116,139,0.92)",
    };
  }, [isDark]);

  const c = comparison;

  return (
    <View style={[styles.wrap, { borderColor: ui.border }]}>
      <BlurView intensity={isDark ? 26 : 40} tint={isDark ? "dark" : "light"} style={styles.card}>
        <LinearGradient colors={ui.cardGrad as any} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

        <View style={[styles.inner, { borderColor: ui.border }]}>
          <LinearGradient colors={ui.innerGrad as any} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

          <View style={styles.headerRow}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.title, { color: ui.text }]} numberOfLines={1}>
                Trend vs previous {rangeLabel}
              </Text>
              <Text style={[styles.subtitle, { color: ui.sub }]} numberOfLines={1}>
                Same-length previous period.
              </Text>
            </View>

            {c?.prev ? (
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.small, { color: ui.sub }]}>Prev cost</Text>
                <Text style={[styles.prevCost, { color: ui.text }]}>{money(c.prev.cost)}</Text>
              </View>
            ) : null}
          </View>

          {c ? (
            <View style={{ marginTop: 10, gap: 10 }}>
              <TrendRow
                label="Cost"
                value={summary.cost}
                delta={c.delta.cost}
                pct={c.deltaPct.cost}
                goodWhenDown={true}
                ui={ui}
              />
              <TrendRow
                label="Manual income"
                value={summary.income.manual}
                delta={c.delta.manual}
                pct={c.deltaPct.manual}
                goodWhenDown={false}
                ui={ui}
              />
              <TrendRow
                label="Net (confirmed)"
                value={summary.netConfirmed}
                delta={c.delta.netConfirmed}
                pct={c.deltaPct.netConfirmed}
                goodWhenDown={false}
                ui={ui}
              />
            </View>
          ) : (
            <Text style={[styles.noData, { color: ui.sub }]}>No comparison data yet.</Text>
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
    padding: 12,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
  },
  small: {
    fontSize: 12,
    fontWeight: "700",
  },
  prevCost: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "700",
  },
  noData: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "700",
  },
  tile: {
    borderRadius: 14,
    // borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },
  rowBottom: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
  },
  value: {
    fontSize: 13,
    fontWeight: "700",
  },
  delta: {
    fontSize: 13,
    fontWeight: "700",
  },
  pct: {
    fontSize: 13,
    fontWeight: "700",
  },
});