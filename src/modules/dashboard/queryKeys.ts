// src/modules/dashboard/queryKeys.ts
import type { RangeKey } from "./api";

export const dashboardKeys = {
  all: ["dashboard"] as const,

  periodAll: () => ["dashboard", "period"] as const,
  period: (range: RangeKey, anchor?: string | null) =>
    ["dashboard", "period", range, anchor ?? null] as const,

  balances: () => ["dashboard", "balances"] as const,
};