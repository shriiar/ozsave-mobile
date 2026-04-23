import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../../context/ThemeContext";
import { money2 } from "./formatters";
import type { BillingSavingsPlanner, BillOccurrence } from "../../api";

type Props = {
  data?: BillingSavingsPlanner;
};

type Sev = "good" | "warn" | "bad";
type MonthKind = "past" | "current" | "future";

type UiVars = {
  text: string;
  sub: string;
  border: string;
  cardGrad: string[];
  innerGrad: string[];
  tileBg: string;
  barTrack: string;
};

function buildUi(isDark: boolean): UiVars {
  return {
    text: isDark ? "rgba(226,232,240,0.92)" : "rgba(15,23,42,0.92)",
    sub: isDark ? "rgba(148,163,184,0.82)" : "rgba(100,116,139,0.92)",
    border: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)",
    cardGrad: isDark
      ? ["rgba(2,6,23,0.58)", "rgba(15,23,42,0.46)", "rgba(2,6,23,0.38)"]
      : ["rgba(255,255,255,0.78)", "rgba(255,255,255,0.62)", "rgba(255,255,255,0.52)"],
    innerGrad: isDark
      ? ["rgba(15,23,42,0.35)", "rgba(2,6,23,0.20)"]
      : ["rgba(237,237,237,0.90)", "rgba(255,255,255,0.65)"],
    tileBg: isDark ? "rgba(15,23,42,0.35)" : "rgba(237,237,237,0.90)",
    barTrack: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
  };
}

function sevColor(sev: Sev): string {
  if (sev === "good") return "#10b981";
  if (sev === "warn") return "#f59e0b";
  return "#ef4444";
}

const CAT_COLORS: Record<string, string> = {
  entertainment: "#8b5cf6",
  utilities: "#06b6d4",
  insurance: "#3b82f6",
  groceries: "#10b981",
  transport: "#f59e0b",
  health: "#ec4899",
  rent: "#ef4444",
  subscriptions: "#6366f1",
};

function catColor(cat: string) {
  return CAT_COLORS[cat.toLowerCase()] ?? "#64748b";
}

function monthKind(month: string): MonthKind {
  const today = new Date();
  const current = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  if (month < current) return "past";
  if (month > current) return "future";
  return "current";
}

function monthKindLabel(kind: MonthKind) {
  if (kind === "past") return { label: "Past month", color: "#94a3b8" };
  if (kind === "future") return { label: "Future month", color: "#6366f1" };
  return { label: "This month", color: "#10b981" };
}

function fmtMonth(m: string) {
  const [y, mo] = m.split("-");
  return new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("en-AU", {
    month: "long",
    year: "numeric",
  });
}

function fmtDate(d: string) {
  const parts = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(parts[2])} ${months[parseInt(parts[1]) - 1]}`;
}

export const BillingSavingsPlannerCard = memo(function BillingSavingsPlannerCard({ data }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const ui = useMemo(() => buildUi(isDark), [isDark]);

  const derived = useMemo(() => {
    if (!data) return null;
    const kind = monthKind(data.month);
    return { kind, kindMeta: monthKindLabel(kind), isFuture: kind === "future" };
  }, [data?.month]);

  if (!data || !derived) return null;

  const { month, bills, totals, budget, suggestions } = data;
  const { mtdIncome, mtdCosts, bufferAfterUpcoming } = budget;
  const { kindMeta, isFuture } = derived;

  const barTotal = Math.max(mtdIncome, mtdCosts + totals.upcoming, 1);
  const costFlex = Math.min(mtdCosts / barTotal, 1);
  const upcomingFlex = Math.min(totals.upcoming / barTotal, 1 - costFlex);
  const bufferFlex = Math.max(0, 1 - costFlex - upcomingFlex);
  const bufferPositive = bufferAfterUpcoming >= 0;

  return (
    <View style={[styles.wrap, { borderColor: ui.border }]}>
      <BlurView intensity={isDark ? 26 : 40} tint={isDark ? "dark" : "light"} style={styles.card}>
        <LinearGradient colors={ui.cardGrad as any} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

        <View style={[styles.inner, { borderColor: ui.border }]}>
          <LinearGradient colors={ui.innerGrad as any} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

          <View style={styles.headerRow}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.title, { color: ui.text }]}>Billing planner</Text>
              <Text style={[styles.subtitle, { color: ui.sub }]}>{fmtMonth(month)}</Text>
            </View>
            <View style={[styles.kindBadge, { backgroundColor: kindMeta.color + "22", borderColor: kindMeta.color + "44" }]}>
              <Text style={[styles.kindLabel, { color: kindMeta.color }]}>{kindMeta.label}</Text>
            </View>
          </View>

          <View style={styles.tilesRow}>
            <Tile label="Paid" value={money2(totals.ran)} accent="#ef4444" ui={ui} />
            <Tile label="Upcoming" value={money2(totals.upcoming)} accent="#f59e0b" ui={ui} />
            <Tile label="Total" value={money2(totals.total)} accent={ui.text} ui={ui} />
          </View>

          {!isFuture ? (
            <View style={styles.barSection}>
              <View style={[styles.barTrack, { backgroundColor: ui.barTrack }]}>
                {costFlex > 0 && (
                  <View style={{ flex: costFlex, height: 12, backgroundColor: "#ef4444" }} />
                )}
                {upcomingFlex > 0 && (
                  <View style={{ flex: upcomingFlex, height: 12, backgroundColor: "#f59e0b" }} />
                )}
                {bufferFlex > 0 && (
                  <View
                    style={{
                      flex: bufferFlex,
                      height: 12,
                      backgroundColor: bufferPositive ? "#10b981" : "#ef4444",
                      opacity: bufferPositive ? 0.65 : 0.35,
                    }}
                  />
                )}
              </View>
              <View style={styles.budgetRow}>
                <BudgetStat label="Income" value={money2(mtdIncome)} color={ui.sub} ui={ui} />
                <BudgetStat label="Costs" value={money2(mtdCosts)} color="#ef4444" ui={ui} />
                <BudgetStat
                  label="Buffer"
                  value={`${bufferPositive ? "" : "-"}${money2(Math.abs(bufferAfterUpcoming))}`}
                  color={bufferPositive ? "#10b981" : "#ef4444"}
                  ui={ui}
                />
              </View>
            </View>
          ) : (
            <View style={[styles.futureNote, { backgroundColor: ui.tileBg }]}>
              <Text style={[styles.futureNoteText, { color: ui.sub }]}>
                No income or costs recorded yet — this month is upcoming.
              </Text>
            </View>
          )}

          {bills.upcoming.length > 0 && (
            <BillList title="Upcoming" bills={bills.upcoming} accent="#f59e0b" ui={ui} />
          )}

          {bills.ran.length > 0 && (
            <BillList title="Paid this month" bills={bills.ran} accent="#10b981" ui={ui} />
          )}

          {suggestions.length > 0 && (
            <View style={styles.suggestionsSection}>
              <Text style={[styles.sectionTitle, { color: ui.sub }]}>Insights</Text>
              {suggestions.map((s, i) => (
                <View key={i} style={[styles.suggestionRow, { backgroundColor: ui.tileBg }]}>
                  <View style={[styles.dot, { backgroundColor: sevColor(s.severity) }]} />
                  <Text style={[styles.suggestionText, { color: ui.text }]} numberOfLines={3}>
                    {s.message}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </BlurView>
    </View>
  );
});

function BudgetStat({
  label,
  value,
  color,
  ui,
}: {
  label: string;
  value: string;
  color: string;
  ui: UiVars;
}) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{ fontSize: 11, fontWeight: "600", color: ui.sub }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: "800", color, marginTop: 3 }}>{value}</Text>
    </View>
  );
}

function Tile({
  label,
  value,
  accent,
  ui,
}: {
  label: string;
  value: string;
  accent: string;
  ui: UiVars;
}) {
  return (
    <View style={[styles.tile, { backgroundColor: ui.tileBg }]}>
      <Text style={[styles.tileLabel, { color: ui.sub }]}>{label}</Text>
      <Text style={[styles.tileValue, { color: accent }]}>{value}</Text>
    </View>
  );
}

function BillList({
  title,
  bills,
  accent,
  ui,
}: {
  title: string;
  bills: BillOccurrence[];
  accent: string;
  ui: UiVars;
}) {
  return (
    <View style={styles.listSection}>
      <Text style={[styles.sectionTitle, { color: ui.sub }]}>{title}</Text>
      <ScrollView
        style={{ maxHeight: 200 }}
        contentContainerStyle={{ paddingBottom: 4 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {bills.map((b, i) => {
          const cc = catColor(b.category);
          return (
            <View
              key={`${b.name}-${b.date}-${i}`}
              style={[styles.billRow, { backgroundColor: ui.tileBg }]}
            >
              <View style={[styles.dot, { backgroundColor: accent }]} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.billName, { color: ui.text }]} numberOfLines={1}>
                  {b.name}
                </Text>
                <Text style={[styles.billDate, { color: ui.sub }]}>{fmtDate(b.date)}</Text>
              </View>
              <View style={[styles.freqChip, { backgroundColor: ui.tileBg }]}>
                <Text style={[styles.freqText, { color: ui.sub }]}>{b.frequency}</Text>
              </View>
              <View style={[styles.catBadge, { backgroundColor: cc + "28" }]}>
                <Text style={[styles.catText, { color: cc }]}>{b.category}</Text>
              </View>
              <Text style={[styles.billAmount, { color: ui.text }]}>{money2(b.amount)}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 18, overflow: "hidden" },
  card: { borderRadius: 18, overflow: "hidden" },
  inner: { borderRadius: 16, padding: 12, overflow: "hidden" },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  title: { fontSize: 14, fontWeight: "700" },
  subtitle: { marginTop: 6, fontSize: 13, fontWeight: "700" },
  kindBadge: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  kindLabel: { fontSize: 11, fontWeight: "700" },

  tilesRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  tile: { flex: 1, borderRadius: 12, padding: 10 },
  tileLabel: { fontSize: 11, fontWeight: "600" },
  tileValue: { marginTop: 4, fontSize: 14, fontWeight: "800" },

  barSection: { marginTop: 14, gap: 8 },
  barTrack: { height: 12, borderRadius: 6, overflow: "hidden", flexDirection: "row" },
  budgetRow: { flexDirection: "row", justifyContent: "space-between" },

  futureNote: {
    marginTop: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  futureNoteText: { fontSize: 12, fontWeight: "600", lineHeight: 17 },

  listSection: { marginTop: 14 },
  sectionTitle: { fontSize: 12, fontWeight: "700", marginBottom: 8 },

  billRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 7,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  billName: { fontSize: 13, fontWeight: "700" },
  billDate: { fontSize: 12, fontWeight: "500", marginTop: 2 },
  freqChip: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  freqText: { fontSize: 10, fontWeight: "600" },
  catBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  catText: { fontSize: 11, fontWeight: "700" },
  billAmount: { fontSize: 13, fontWeight: "700" },

  suggestionsSection: { marginTop: 14 },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 7,
  },
  suggestionText: { flex: 1, fontSize: 13, fontWeight: "600", lineHeight: 18 },
});
