import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../../../../context/ThemeContext";
import type { PeriodDashboard, Insight } from "./types";

type Props = { data: PeriodDashboard };

function severityDotColor(sev?: "good" | "warn" | "bad") {
  if (sev === "good") return "#34D399";
  if (sev === "bad") return "#F87171";
  return "#FBBF24";
}

export function IncomeInsightsCard({ data }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const T = useMemo(() => {
    // Match your design intent: clean glass-ish, no shadows
    const bg = isDark ? "rgba(2,6,23,0.60)" : "rgba(237,237,237,1)";
    const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";

    const title = isDark ? "rgba(255,255,255,0.92)" : "#0F172A";
    const sub = isDark ? "rgba(148,163,184,0.82)" : "#475569";
    const detail = isDark ? "rgba(148,163,184,0.88)" : "#64748B";

    const badgeBg = isDark ? "rgba(15,23,42,0.35)" : "rgba(237,237,237,1)";
    const badgeBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";

    const tileBg = isDark ? "rgba(15,23,42,0.35)" : "rgba(237,237,237,1)";
    const tileBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";

    return { bg, border, title, sub, detail, badgeBg, badgeBorder, tileBg, tileBorder };
  }, [isDark]);

  const m: any = (data as any)?.incomeMetrics;

  const points: Insight[] = useMemo(() => {
    if (!m) return [];

    const out: Insight[] = [];
    const covC = m?.coverage?.confirmedPct;
    const covP = m?.coverage?.projectedPct;
    const rel = m?.reliability?.confirmedRatioPct;
    const missing = Number(m?.missingManualDays ?? 0);

    if (rel !== null && rel !== undefined) {
      out.push({
        title: "Income reliability",
        detail: `${rel}% manual vs estimate.`,
        severity: rel >= 70 ? "good" : rel >= 40 ? "warn" : "bad",
      });
    }

    if (covC !== null && covC !== undefined) {
      out.push({
        title: "Confirmed coverage",
        detail: `Manual income covers ${covC}% of costs.`,
        severity: covC >= 100 ? "good" : covC >= 80 ? "warn" : "bad",
      });
    }

    if (covP !== null && covP !== undefined) {
      out.push({
        title: "Projected coverage",
        detail: `Manual+estimate covers ${covP}% of costs.`,
        severity: covP >= 100 ? "good" : covP >= 80 ? "warn" : "bad",
      });
    }

    if (missing > 0) {
      out.push({
        title: "Missing manual income logs",
        detail: `${missing} day(s) had 0 manual income.`,
        severity: missing >= 5 ? "bad" : "warn",
      });
    }

    return out;
  }, [m]);

  const headline =
    points.find((p) => p.severity === "bad")?.title ??
    points.find((p) => p.severity === "warn")?.title ??
    "Quick takeaways for income this period.";

  if (!m) {
    return (
      <View style={[styles.outer, { backgroundColor: T.bg, borderColor: T.border }]}>
        <Text style={[styles.title, { color: T.title }]}>Income insights</Text>
        <Text style={[styles.subtitle, { color: T.sub }]}>
          Backend hasn’t sent incomeMetrics yet.
        </Text>
        <View style={{ flex: 1 }} />
      </View>
    );
  }

  return (
    <View style={[styles.outer, { backgroundColor: T.bg, borderColor: T.border }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.title, { color: T.title }]}>Income insights</Text>
          <Text style={[styles.subtitle, { color: T.sub }]} numberOfLines={2}>
            {headline}
          </Text>
        </View>

        {points.length ? (
          <View
            style={[
              styles.badge,
              { backgroundColor: T.badgeBg, borderColor: T.badgeBorder },
            ]}
          >
            <Text style={[styles.badgeText, { color: T.title }]}>{points.length}</Text>
          </View>
        ) : null}
      </View>

      {/* Body */}
      <View style={styles.body}>
        {points.length ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {points.map((p, idx) => (
              <View
                key={`${p.title}-${idx}`}
                style={[
                  styles.tile,
                  { backgroundColor: T.tileBg, borderColor: T.tileBorder },
                ]}
              >
                <View style={styles.tileRow}>
                  <View style={[styles.dot, { backgroundColor: severityDotColor(p.severity) }]} />

                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[styles.tileTitle, { color: T.title }]} numberOfLines={1}>
                      {p.title}
                    </Text>
                    <Text style={[styles.tileDetail, { color: T.detail }]} numberOfLines={1}>
                      {p.detail || " "}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={[styles.empty, { color: T.sub }]}>No income insights.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  title: {
    fontSize: 14,
    fontWeight: "800",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 13,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "900",
  },

  body: {
    marginTop: 10,
    flex: 1,
    overflow: "hidden",
  },

  listContent: {
    paddingBottom: 6,
    gap: 8,
  },

  tile: {
    height: 68,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },

  tileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },

  tileTitle: {
    fontSize: 13,
    fontWeight: "800",
  },

  tileDetail: {
    marginTop: 2,
    fontSize: 13,
  },

  empty: {
    fontSize: 13,
  },
});