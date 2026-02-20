// src/modules/dashboard/components/DashboardProvider.tsx
import React from "react";
import DashboardSkeleton from "./DashboardSkeleton";
import DashboardWithHouse from "./DashboardWithHouse";
import { usePeriodDashboard, useDashboardBalances } from "../hooks/hook";

type House = {
  _id: string;
  name: string;
};

export default function DashboardProvider({ house }: { house: House }) {
  // ✅ match your hook signature: (range, anchor?)
  const period = usePeriodDashboard("7d");
  const balances = useDashboardBalances();

  const isLoading = period.isLoading || balances.isLoading;
  const isError = period.isError || balances.isError;

  // ✅ One unified loading UI
  if (isLoading) return <DashboardSkeleton />;

  // ✅ Unified error handling (still pass partial data if you want)
  if (isError) {
    return (
      <DashboardWithHouse
        house={house}
        period={period.data ?? null}
        balances={balances.data ?? null}
        error="Failed to load dashboard data."
      />
    );
  }

  return (
    <DashboardWithHouse
      house={house}
      period={period.data ?? null}
      balances={balances.data ?? null}
      error={null}
    />
  );
}