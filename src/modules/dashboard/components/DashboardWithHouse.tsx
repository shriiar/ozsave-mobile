import React, { useMemo, useState, useEffect, useRef } from "react";
import Toast from "react-native-toast-message";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
  LayoutChangeEvent,
} from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { DashboardHeader } from "./period/DashboardHeader";
import type { RangeKey } from "./period/DashboardHeader";
import { DashboardBarChart } from "./period/DashboardBarChart";
import type { BarPoint } from "./period/DashboardBarChart";
import {
  CategoryInsights,
  CategoryPieItem,
  CategorySectionCard,
} from "./period/CategorySectionCard";
import { PeriodSummaryCards } from "./period/PeriodSummaryCards";
import DashboardBalancesCard from "./period/DashboardBalancesCard";
import { TrendVsPreviousCard } from "./period/TrendVsPreviousCard";
import { WidgetStack } from "./period/WidgetStack";
import { SmartAlertsCard } from "./period/SmartAlertsCard";
import { InsightsGridCard } from "./period/InsightsGridCard";
import { IncomeInsightsCard } from "./period/IncomeInsightsCard";
import DashboardAiSummaryButton from "./period/DashboardAiSummaryButton";
import DashboardAiSummaryModal from "./period/DashboardAiSummaryModal";
import { BillingSavingsPlannerCard } from "./period/BillingSavingsPlannerCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const label =
    range === "7d"
      ? "Last 7 days"
      : range === "14d"
        ? "Last 14 days"
        : range === "30d"
          ? "Last 30 days"
          : "Last 90 days";

  return { label };
}

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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const shownErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (!error) {
      shownErrorRef.current = null;
      return;
    }

    if (shownErrorRef.current === error) return;

    shownErrorRef.current = error;

    Toast.show({
      type: "error",
      text1: "Something went wrong",
      text2: error,
      position: "top",
      autoHide: false,
      onPress: () => Toast.hide(),
    });
  }, [error]);

  const insets = useSafeAreaInsets();
  const TOPBAR_H = 52;
  const bottomSpace = TOPBAR_H + insets.bottom + 16;

  const T = useMemo(() => {
    const bg = isDark ? "#050814" : "#F6F7FB";
    const text = isDark ? "rgba(255,255,255,0.92)" : "#0F172A";
    const muted = isDark ? "rgba(148,163,184,0.82)" : "#64748B";
    return { bg, text, muted };
  }, [isDark]);

  const rangeMeta = useMemo(() => rangeMetaOf(range), [range]);

  const subtitle = useMemo(() => {
    if (period?.start && period?.end) return `${period.start} → ${period.end}`;
    return " ";
  }, [period?.start, period?.end]);

  const refreshing = !!isFetching;

  const [viewportH, setViewportH] = useState(0);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const onLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h && h !== viewportH) setViewportH(h);
  };

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

  const summary = useMemo(() => {
    return {
      totalCost: Number(period?.summary?.cost ?? 0),
      manualIncome: Number(period?.summary?.income?.manual ?? 0),
      estimatedIncome: Number(period?.summary?.income?.estimate ?? 0),
    };
  }, [period]);

  if (!house) {
    return (
      <View style={[styles.screen, { backgroundColor: T.bg }]}>
        <Text style={{ color: T.muted, padding: 16 }}>No house data available.</Text>
      </View>
    );
  }

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
        showsVerticalScrollIndicator={false}
        overScrollMode="always"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={Platform.OS === "ios" ? 16 : 0}
          />
        }
        contentContainerStyle={[
          styles.container,
          { minHeight: viewportH || undefined, paddingBottom: bottomSpace },
        ]}
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

        <DashboardAiSummaryButton onPress={() => setSummaryOpen(true)} />

        <PeriodSummaryCards
          rangeLabel={rangeMeta.label}
          totalCost={summary.totalCost}
          manualIncome={summary.manualIncome}
          estimatedIncome={summary.estimatedIncome}
        />

        <DashboardBarChart data={barData} />

        <BillingSavingsPlannerCard data={period?.billingSavingsPlanner} />

        <CategorySectionCard
          pie={categoryPie}
          categoryInsights={categoryInsights}
        />

        {/* <DashboardBalancesCard house={house} /> */}

        <TrendVsPreviousCard
          rangeLabel={rangeMeta.label}
          summary={
            period?.summary ?? {
              cost: 0,
              income: { manual: 0, estimate: 0 },
            }
          }
          comparison={period?.comparison ?? null}
        />

        <WidgetStack height={400}>
          <SmartAlertsCard alerts={period?.smartAlerts ?? []} />
          <InsightsGridCard insights={period?.insights ?? []} />
          <IncomeInsightsCard data={period ?? {}} />
        </WidgetStack>

        {!period ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: T.text }]}>No analytics yet</Text>
            <Text style={[styles.emptySub, { color: T.muted }]}>
              Start adding costs and income to see your dashboard fill up.
            </Text>
          </View>
        ) : null}

        <View style={{ flexGrow: 1 }} />
      </ScrollView>
      <DashboardAiSummaryModal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: {
    padding: 16,
    gap: 12,
    flexGrow: 1,
  },
  emptyState: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  emptySub: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
});