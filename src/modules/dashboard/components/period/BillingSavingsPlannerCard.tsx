import React, { memo, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
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
      ? ["rgba(5,5,5,0.58)", "rgba(18,18,18,0.46)", "rgba(5,5,5,0.38)"]
      : ["rgba(255,255,255,0.78)", "rgba(255,255,255,0.62)", "rgba(255,255,255,0.52)"],
    innerGrad: isDark
      ? ["rgba(22,22,22,0.55)", "rgba(12,12,12,0.40)"]
      : ["rgba(237,237,237,0.90)", "rgba(255,255,255,0.65)"],
    tileBg: isDark ? "rgba(22,22,22,0.60)" : "rgba(237,237,237,0.90)",
    barTrack: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
  };
}

function sevColor(sev: Sev): string {
  if (sev === "good") return "#10b981";
  if (sev === "warn") return "#f59e0b";
  return "#ef4444";
}

function sevLabel(sev: Sev): string {
  if (sev === "good") return "SAFE";
  if (sev === "warn") return "NOTE";
  return "ALERT";
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

  const [showPaid, setShowPaid] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  if (!data || !derived) return null;

  const { month, bills, totals, budget, suggestions } = data;
  const { mtdIncome, mtdCosts, bufferAfterUpcoming } = budget;
  const { kindMeta, isFuture } = derived;

  const barTotal = Math.max(mtdIncome, mtdCosts + totals.upcoming, 1);
  const incomeFlex = Math.min(mtdIncome / barTotal, 1);
  const costFlex = Math.min(mtdCosts / barTotal, 1);
  const upcomingFlex = Math.min(totals.upcoming / barTotal, 1 - costFlex);
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

          <View style={styles.tilesGrid}>
            <View style={styles.tilesRow}>
              <Tile label="Paid" value={money2(totals.ran)} accent="#ef4444" ui={ui} />
              <Tile label="Upcoming" value={money2(totals.upcoming)} accent="#f59e0b" ui={ui} />
              <Tile label="Total" value={money2(totals.total)} accent={ui.text} ui={ui} />
            </View>
            <View style={styles.tilesRow}>
              <Tile label="Income" value={money2(mtdIncome)} accent="#10b981" ui={ui} />
              <Tile label="Monthly costs" value={money2(mtdCosts)} accent="#6366f1" ui={ui} />
            </View>
          </View>

          {!isFuture ? (
            <View style={styles.barSection}>
              <BarRow label="Income" value={money2(mtdIncome)} ui={ui}>
                <View style={[styles.barTrack, { backgroundColor: ui.barTrack }]}>
                  <View style={{ flex: incomeFlex, height: 14, backgroundColor: "#10b981", opacity: 0.85 }} />
                  <View style={{ flex: Math.max(0, 1 - incomeFlex), height: 14 }} />
                </View>
              </BarRow>
              <BarRow label="Costs" value={money2(mtdCosts + totals.upcoming)} ui={ui}>
                <View style={[styles.barTrack, { backgroundColor: ui.barTrack }]}>
                  {costFlex > 0 && <View style={{ flex: costFlex, height: 14, backgroundColor: "#ef4444" }} />}
                  {upcomingFlex > 0 && <View style={{ flex: upcomingFlex, height: 14, backgroundColor: "#f59e0b" }} />}
                  <View style={{ flex: Math.max(0, 1 - costFlex - upcomingFlex), height: 14 }} />
                </View>
              </BarRow>
              <View style={styles.bufferRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: ui.sub }} />
                  <Text style={{ fontSize: 11, fontWeight: "600", color: ui.sub }}>Buffer after upcoming</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: "800", color: ui.text }}>
                  {bufferPositive ? "+" : "-"}{money2(Math.abs(bufferAfterUpcoming))}
                </Text>
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
            <BillList title="Upcoming bills" bills={bills.upcoming} accent="#f59e0b" ui={ui} />
          )}

          {bills.ran.length > 0 && (
            <View style={styles.listSection}>
              <TouchableOpacity style={styles.collapseHeader} onPress={() => setShowPaid(v => !v)} activeOpacity={0.7}>
                <Text style={[styles.sectionTitle, { color: ui.sub, marginBottom: 0 }]}>Paid this month</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: ui.sub }}>{bills.ran.length} bills</Text>
                  <Text style={{ fontSize: 13, color: ui.sub }}>{showPaid ? "▾" : "›"}</Text>
                </View>
              </TouchableOpacity>
              {showPaid && (
                <ScrollView
                  style={{ maxHeight: 200, marginTop: 8 }}
                  contentContainerStyle={{ paddingBottom: 4 }}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                >
                  {bills.ran.map((b, i) => <BillItem key={`${b.name}-${b.date}-${i}`} b={b} accent="#10b981" ui={ui} />)}
                </ScrollView>
              )}
            </View>
          )}

          {suggestions.length > 0 && (
            <View style={styles.suggestionsSection}>
              <TouchableOpacity style={styles.collapseHeader} onPress={() => setShowInsights(v => !v)} activeOpacity={0.7}>
                <Text style={[styles.sectionTitle, { color: ui.sub, marginBottom: 0 }]}>Insights</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: ui.sub }}>{suggestions.length} notes</Text>
                  <Text style={{ fontSize: 13, color: ui.sub }}>{showInsights ? "▾" : "›"}</Text>
                </View>
              </TouchableOpacity>
              {showInsights && suggestions.map((s, i) => (
                <View key={i} style={[styles.suggestionRow, { backgroundColor: ui.tileBg }]}>
                  <View style={{ width: 3, borderRadius: 2, alignSelf: "stretch", backgroundColor: sevColor(s.severity) }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, fontWeight: "800", color: sevColor(s.severity), marginBottom: 3, letterSpacing: 0.4 }}>
                      {sevLabel(s.severity)}
                    </Text>
                    <Text style={[styles.suggestionText, { color: ui.text }]} numberOfLines={3}>
                      {s.message}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </BlurView>
    </View>
  );
});

function BarRow({
  label,
  value,
  ui,
  children,
}: {
  label: string;
  value: string;
  ui: UiVars;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.barRow}>
      <Text style={[styles.barRowLabel, { color: ui.sub }]}>{label}</Text>
      <View style={{ flex: 1 }}>{children}</View>
      <Text style={[styles.barRowValue, { color: ui.text }]}>{value}</Text>
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

function BillItem({ b, accent, ui }: { b: BillOccurrence; accent: string; ui: UiVars }) {
  const cc = catColor(b.category);
  return (
    <View style={[styles.billRow, { backgroundColor: ui.tileBg }]}>
      <View style={{ width: 3, borderRadius: 2, alignSelf: "stretch", backgroundColor: accent }} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[styles.billName, { color: ui.text }]} numberOfLines={1}>{b.name}</Text>
        <Text style={[styles.billDate, { color: ui.sub }]}>{fmtDate(b.date)}</Text>
      </View>
      <View style={[styles.freqChip, { borderColor: ui.border }]}>
        <Text style={[styles.freqText, { color: ui.sub }]}>{b.frequency}</Text>
      </View>
      <View style={[styles.catBadge, { backgroundColor: cc + "28" }]}>
        <Text style={[styles.catText, { color: cc }]}>{b.category}</Text>
      </View>
      <Text style={[styles.billAmount, { color: ui.text }]}>{money2(b.amount)}</Text>
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
        {bills.map((b, i) => (
          <BillItem key={`${b.name}-${b.date}-${i}`} b={b} accent={accent} ui={ui} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 18, overflow: "hidden" },
  card: { borderRadius: 18, overflow: "hidden" },
  inner: { borderRadius: 16, padding: 16, overflow: "hidden" },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  title: { fontSize: 14, fontWeight: "700" },
  subtitle: { marginTop: 8, fontSize: 13, fontWeight: "700" },
  kindBadge: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  kindLabel: { fontSize: 11, fontWeight: "700" },

  tilesGrid: { gap: 10, marginTop: 16 },
  tilesRow: { flexDirection: "row", gap: 10 },
  tile: { flex: 1, borderRadius: 12, padding: 14 },
  tileLabel: { fontSize: 11, fontWeight: "600" },
  tileValue: { marginTop: 5, fontSize: 15, fontWeight: "800" },

  barSection: { marginTop: 18, gap: 10 },
  barTrack: { height: 16, borderRadius: 8, overflow: "hidden", flexDirection: "row" },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  barRowLabel: { fontSize: 11, fontWeight: "600", width: 52 },
  barRowValue: { fontSize: 12, fontWeight: "800", width: 64, textAlign: "right" },
  bufferRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 6 },

  futureNote: {
    marginTop: 16,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  futureNoteText: { fontSize: 12, fontWeight: "600", lineHeight: 18 },

  listSection: { marginTop: 18 },
  collapseHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitleRow: { borderLeftWidth: 3, paddingLeft: 7, marginBottom: 10 },
  sectionTitle: { fontSize: 12, fontWeight: "700", marginBottom: 10 },

  billRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  billName: { fontSize: 13, fontWeight: "700" },
  billDate: { fontSize: 12, fontWeight: "500", marginTop: 3 },
  freqChip: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 4, borderWidth: StyleSheet.hairlineWidth },
  freqText: { fontSize: 10, fontWeight: "600" },
  catBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  catText: { fontSize: 11, fontWeight: "700" },
  billAmount: { fontSize: 13, fontWeight: "700" },

  suggestionsSection: { marginTop: 18 },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 13,
    marginBottom: 8,
    overflow: "hidden",
  },
  suggestionText: { flex: 1, fontSize: 13, fontWeight: "600", lineHeight: 19 },
});
