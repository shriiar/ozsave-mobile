// src/modules/dashboard/api.ts
import { apiRequest } from "../../lib/api";

export type RangeKey = "7d" | "14d" | "30d";

/** Shared leaf types */
export type Insight = {
  title: string;
  subtitle?: string;
  detail?: string;
  severity?: "good" | "warn" | "bad";
};

export type CategoryInsightTop = {
  category: string;
  current: number;
  previous: number;
  delta: number;
  deltaPct: number | null;
  currentSharePct: number;
};

export type CategoryInsights = {
  headline?: string | null;
  top3: CategoryInsightTop[];
};

export type CostTrends = {
  range: "30d";
  labels: string[];
  series: { cost: number[] };
  stats: {
    dailyAverage: number;
    mostExpensiveDay: { dayKey: string; amount: number };
    cheapestDay: { dayKey: string; amount: number };
  };
};

export type HouseHealth = {
  range: "30d";
  status: "stable" | "overspending" | "improving";
  color: "blue" | "red" | "green";
  score: number;
  metrics: {
    avgDailyCost: number;
    prevAvgDailyCost: number;
    changePct: number | null;
  };
};

export type SmartAlert = {
  title: string;
  detail?: string;
  severity: "good" | "warn" | "bad";
  kind: "spend" | "balance" | "income";
};

export type BillOccurrence = {
  name: string;
  category: string;
  frequency: string;
  date: string;
  amount: number;
  amountCents: number;
  status: "ran" | "upcoming";
};

export type BillingSavingsPlanner = {
  month: string;
  bills: {
    ran: BillOccurrence[];
    upcoming: BillOccurrence[];
  };
  totals: {
    ran: number;
    upcoming: number;
    total: number;
  };
  budget: {
    mtdIncome: number;
    mtdCosts: number;
    bufferAfterUpcoming: number;
  };
  suggestions: Array<{
    message: string;
    severity: "good" | "warn" | "bad";
  }>;
};

export type PeriodDashboardResponse = {
  range: RangeKey;
  start: string;
  end: string;
  labels: string[];

  series: {
    cost: number[];
    income: { manual: number[]; estimate: number[] };
    net: number[];
  };

  summary: {
    cost: number;
    income: { manual: number; estimate: number };
    netConfirmed: number;
    netProjected: number;
  };

  breakdown?: {
    costByCategory: { category: string; amount: number; percent: number }[];
  };

  comparison?: {
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

  insights?: Insight[];
  categoryInsights?: CategoryInsights;
  costTrends?: CostTrends;
  houseHealth?: HouseHealth;
  smartAlerts?: SmartAlert[];
  billingSavingsPlanner?: BillingSavingsPlanner;
};

export type DashboardBalancesResponse = {
  houseId: string;

  totals: {
    youOwe: number;
    owedToYou: number;
    net: number;
  };

  youOwe: Array<{ userId: string; amount: number }>;
  owedToYou: Array<{ userId: string; amount: number }>;
};

export type GeminiSummaryPeriod = {
  summary: string;
  suggestions: string[];
  warning?: string | null;
};

export type GeminiSummaryResponse = {
  weekly?: GeminiSummaryPeriod;
  fortnightly?: GeminiSummaryPeriod;
  monthly?: GeminiSummaryPeriod;
  historicalComparison?: Record<string, string>;
  overallObservation?: string;
};

// Backend sometimes returns envelope or direct payload
type ApiEnvelope<T> = {
  statusCode: number;
  message: string;
  data: T;
};

function unwrap<T>(res: any): T {
  return (res?.data?.data ?? res?.data ?? res) as T;
}

export const DashboardApi = {
  // GET /dashboard/period?range=7d|14d|30d&anchor=YYYY-MM-DD
  async getPeriod(params: { range: RangeKey; anchor?: string }) {
    const qs = new URLSearchParams();
    qs.set("range", params.range);
    if (params.anchor) qs.set("anchor", params.anchor);

    const res = await apiRequest<ApiEnvelope<PeriodDashboardResponse>>(
      "GET",
      `/dashboard/period?${qs.toString()}`
    );

    return unwrap<PeriodDashboardResponse>(res);
  },

  // GET /dashboard/weekly?anchor=...
  async getWeekly(anchor?: string) {
    const qs = anchor ? `?anchor=${encodeURIComponent(anchor)}` : "";
    const res = await apiRequest<ApiEnvelope<PeriodDashboardResponse>>(
      "GET",
      `/dashboard/weekly${qs}`
    );
    return unwrap<PeriodDashboardResponse>(res);
  },

  // GET /dashboard/balances
  async getBalances() {
    const res = await apiRequest<ApiEnvelope<DashboardBalancesResponse>>(
      "GET",
      `/dashboard/balances`
    );
    return unwrap<DashboardBalancesResponse>(res);
  },
  
  async getGeminiSummary() {
    const res = await apiRequest<ApiEnvelope<GeminiSummaryResponse>>(
      "GET",
      `/gemeni/summary`
    );
    return unwrap<GeminiSummaryResponse>(res);
  },
};