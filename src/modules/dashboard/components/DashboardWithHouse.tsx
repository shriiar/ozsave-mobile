import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Platform,
  LayoutChangeEvent,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { DashboardHeader } from "./period/DashboardHeader";
import type { RangeKey } from "./period/DashboardHeader";
import { DashboardBarChart } from "./period/DashboardBarChart";
import type { BarPoint } from "./period/DashboardBarChart";
import { CategoryInsights, CategoryPieItem, CategorySectionCard } from "./period/CategorySectionCard";

type HouseBase = { _id: string; name: string };
type PeriodDashboard = any;
type DashboardBalances = any;

type Props = {
  house: HouseBase | null;
  period: PeriodDashboard | null;
  balances: DashboardBalances | null;
  error: string | null;

  range: RangeKey;
  anchor: string;
  canGoForward: boolean;

  isFetching?: boolean;
  onRefresh: () => Promise<any> | void;
  onPrev: () => void;
  onNext: () => void;
  onRangeChange: (r: RangeKey) => void;
};

function rangeMetaOf(range: RangeKey) {
  const days = range === "7d" ? 7 : range === "14d" ? 14 : range === "30d" ? 30 : 90;
  const label =
    range === "7d"
      ? "Last 7 days"
      : range === "14d"
        ? "Last 14 days"
        : range === "30d"
          ? "Last 30 days"
          : "Last 90 days";
  return { days, label };
}

// quick date label helper: "2026-02-23" -> "02/23"
function shortLabel(ymd: string) {
  if (!ymd || typeof ymd !== "string") return "";
  const mm = ymd.slice(5, 7);
  const dd = ymd.slice(8, 10);
  return mm && dd ? `${mm}/${dd}` : ymd;
}

export default function DashboardWithHouse({
  house,
  period,
  balances,
  error,
  range,
  anchor,
  canGoForward,
  isFetching,
  onRefresh,
  onPrev,
  onNext,
  onRangeChange,
}: Props) {
  // ✅ ALL HOOKS UP HERE. No hooks after early returns.
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const T = useMemo(() => {
    const bg = isDark ? "#050814" : "#F6F7FB";
    const text = isDark ? "rgba(255,255,255,0.92)" : "#0F172A";
    const muted = isDark ? "rgba(148,163,184,0.82)" : "#64748B";
    const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
    const danger = isDark ? "#FCA5A5" : "#B91C1C";
    return { bg, text, muted, border, danger };
  }, [isDark]);

  const rangeMeta = useMemo(() => rangeMetaOf(range), [range]);

  // ✅ subtitle always reserves height to prevent header jump
  const subtitle = useMemo(() => {
    if (period?.start && period?.end) return `${period.start} → ${period.end}`;
    return " "; // reserve line height
  }, [period?.start, period?.end]);

  const refreshing = !!isFetching;

  // ✅ keep pull-to-refresh working even with little content
  const [viewportH, setViewportH] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h && h !== viewportH) setViewportH(h);
  };

  // ✅ barData ALWAYS computed (safe even if period is null)
  const barData: BarPoint[] = useMemo(() => {
    const labels: string[] = period?.labels ?? [];
    if (!labels.length) return [];

    const cost: any[] = period?.series?.cost ?? [];
    const manual: any[] = period?.series?.income?.manual ?? [];
    const estimate: any[] = period?.series?.income?.estimate ?? [];

    return labels.map((dayKey: string, i: number) => ({
      dayKey,
      dayLabel: shortLabel(dayKey),
      cost: Number(cost[i] ?? 0),
      manual: Number(manual[i] ?? 0),
      estimate: Number(estimate[i] ?? 0),
    }));
  }, [period]);

  // Pie chart
  const categoryPie: CategoryPieItem[] = useMemo(() => {
    const raw = period?.breakdown?.costByCategory ?? [];
    if (!Array.isArray(raw)) return [];

    return raw
      .filter((x: any) => x && x.category != null)
      .map((x: any) => ({
        category: String(x.category),
        amount: Number(x.amount ?? 0),
        percent: Number(x.percent ?? 0),
      }));
  }, [period]);

  const categoryInsights: CategoryInsights | undefined = useMemo(() => {
    const ci = period?.categoryInsights;
    if (!ci || typeof ci !== "object") return undefined;
    return ci;
  }, [period]);

  // ------------------ EARLY RETURNS AFTER HOOKS ------------------

  if (!house) {
    return (
      <View style={[styles.screen, { backgroundColor: T.bg }]}>
        <Text style={{ color: T.muted, padding: 16 }}>No house data available.</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.screen, { backgroundColor: T.bg, padding: 16 }]}>
        <Text style={{ color: T.text, fontWeight: "900", fontSize: 16 }}>Failed to load</Text>
        <Text style={{ color: T.danger, marginTop: 6 }}>{error}</Text>

        <Pressable
          onPress={onRefresh}
          style={({ pressed }) => [{ marginTop: 12, opacity: pressed ? 0.9 : 1 }]}
        >
          <View
            style={{
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: T.border,
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: T.text, fontWeight: "900" }}>Retry</Text>
          </View>
        </Pressable>
      </View>
    );
  }

  if (!period) {
    return (
      <View style={[styles.screen, { backgroundColor: T.bg, padding: 16 }]}>
        <Text style={{ color: T.text, fontWeight: "900", fontSize: 16 }}>Dashboard</Text>
        <Text style={{ color: T.muted, marginTop: 6 }}>No analytics data yet.</Text>
      </View>
    );
  }

  // ------------------ MAIN RENDER ------------------

  return (
    <View style={[styles.screen, { backgroundColor: T.bg }]} onLayout={onLayout}>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="always"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        scrollEventThrottle={16}
        alwaysBounceVertical
        bounces
        overScrollMode="always"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={Platform.OS === "ios" ? 16 : 0}
          />
        }
        contentContainerStyle={[styles.container, { minHeight: viewportH || undefined }]}
      >
        <DashboardHeader
          range={range}
          onRangeChange={onRangeChange}
          title={rangeMeta.label}
          subtitle={subtitle}
          canGoForward={canGoForward}
          onPrev={onPrev}
          onNext={onNext}
        />

        {/* ✅ Chart */}
        <DashboardBarChart data={barData} />

        <CategorySectionCard pie={categoryPie} categoryInsights={categoryInsights} />

        <View style={{ flexGrow: 1 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: {
    padding: 16,
    paddingBottom: 28,
    gap: 12,
    flexGrow: 1,
  },
  placeholderCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 14,
  },
  fetchOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 12,
    alignItems: "center",
  },
  fetchPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
});