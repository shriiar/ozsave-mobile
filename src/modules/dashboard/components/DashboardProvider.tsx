import React, { useCallback, useMemo, useState } from "react";
import DashboardWithHouse from "./DashboardWithHouse";
import { usePeriodDashboard, useDashboardBalances } from "../hooks/hook";
import type { RangeKey } from "./period/DashboardHeader";

type House = { _id: string; name: string };

function toYmd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function todayKey() {
  return toYmd(new Date());
}

function shiftDate(ymd: string, deltaDays: number) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + deltaDays);
  return toYmd(dt);
}

function rangeDays(range: RangeKey) {
  return range === "7d" ? 7 : range === "14d" ? 14 : 30;
}

export default function DashboardProvider({ house }: { house: House }) {
  const [range, setRange] = useState<RangeKey>("7d");
  const [anchor, setAnchor] = useState(todayKey());

  const today = useMemo(() => todayKey(), []);
  const canGoForward = anchor < today;

  const period = usePeriodDashboard(range, anchor);
  const balances = useDashboardBalances();

  const isError = period.isError || balances.isError;
  const isFetching = period.isFetching || balances.isFetching;

  const onRefresh = useCallback(async () => {
    await Promise.all([period.refetch(), balances.refetch()]);
  }, [period, balances]);

  const onPrev = useCallback(() => {
    setAnchor((prev) => shiftDate(prev, -rangeDays(range)));
  }, [range]);

  const onNext = useCallback(() => {
    setAnchor((prev) => {
      const next = shiftDate(prev, +rangeDays(range));
      return next > today ? today : next;
    });
  }, [range, today]);

  const onRangeChange = useCallback((next: RangeKey) => {
    setRange(next);
    setAnchor(todayKey());
  }, []);

  return (
    <DashboardWithHouse
      house={house}
      range={range}
      anchor={anchor}
      canGoForward={canGoForward}
      period={period.data ?? null}
      balances={balances.data ?? null}
      error={isError ? "Failed to load dashboard data." : null}
      isFetching={isFetching}
      onRefresh={onRefresh}
      onPrev={onPrev}
      onNext={onNext}
      onRangeChange={onRangeChange}
    />
  );
}