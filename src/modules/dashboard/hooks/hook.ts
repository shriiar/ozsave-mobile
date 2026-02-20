// src/modules/dashboard/hooks.ts
"use client";

import { QueryClient, useQuery } from "@tanstack/react-query";
import {
  DashboardApi,
  type DashboardBalancesResponse,
  type PeriodDashboardResponse,
  type RangeKey,
} from "../api";

// Centralize keys so invalidate + hooks always match
export const dashboardKeys = {
  periodRoot: ["dashboardPeriod"] as const,
  period: (range: RangeKey, anchor?: string | null) =>
    ["dashboardPeriod", range, anchor ?? null] as const,

  balances: ["dashboardBalances"] as const,
};

export function usePeriodDashboard(range: RangeKey, anchor?: string) {
  return useQuery<PeriodDashboardResponse>({
    queryKey: dashboardKeys.period(range, anchor ?? null),
    queryFn: () => DashboardApi.getPeriod({ range, anchor }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: !!range, // safety
  });
}

export function useDashboardBalances() {
  return useQuery<DashboardBalancesResponse>({
    queryKey: dashboardKeys.balances,
    queryFn: () => DashboardApi.getBalances(),
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function invalidateDashboard(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: dashboardKeys.periodRoot, // ["dashboardPeriod"]
      exact: false,
      refetchType: "active", // use "all" only if you want inactive queries to refetch too
    }),
    queryClient.invalidateQueries({
      queryKey: dashboardKeys.balances, // ["dashboardBalances"]
      exact: true,
      refetchType: "active",
    }),
  ]);
}