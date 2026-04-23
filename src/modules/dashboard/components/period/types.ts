export type RangeKey = "7d" | "14d" | "30d";

export type PeriodDashboard = {
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

  insights?: Array<Insight>;

  // -------------------- C, D, E, F (cost-side) --------------------
  categoryInsights?: CategoryInsights;

  costTrends?: CostTrends;

  houseHealth?: HouseHealth;

  smartAlerts?: Array<SmartAlert>;

  billingSavingsPlanner?: BillingSavingsPlanner;

  // -------------------- NEW: Income widgets --------------------
  incomeMetrics?: {
    coverage: { confirmedPct: number | null; projectedPct: number | null };
    reliability: { confirmedRatioPct: number | null };
    missingManualDays: number;
    totals: { cost: number; manualIncome: number; estimateIncome: number };
  };

  incomeTrends30d?: {
    range: "30d";
    labels: string[];
    series: { manual: number[]; estimate: number[]; total: number[] };
    stats: {
      dailyAverageTotal: number;
      bestIncomeDay: { dayKey: string; amount: number };
      worstIncomeDay: { dayKey: string; amount: number };
      zeroManualDays: number;
    };
  };

  incomeAlerts?: Array<{
    title: string;
    detail?: string;
    severity: "good" | "warn" | "bad";
  }>;
};

export type DashboardEnvelope = {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: any;
};

export type RangeOption = { key: RangeKey; label: string; days: number };

// -------------------- chart points --------------------
export type BarPoint = {
  dayKey: string;
  dayLabel: string;
  cost: number;
  manual: number;
  estimate: number;
};

export type TrendPoint = {
  dayKey: string;
  dayLabel: string;
  cost: number;
};

// NEW: income trend chart point
export type IncomeTrendPoint = {
  dayKey: string;
  dayLabel: string;
  manual: number;
  estimate: number;
  total: number;
};

// -------------------- shared types --------------------
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

// NEW: Income trends block (30d)
export type IncomeTrends = {
  range: "30d";
  labels: string[];
  series: {
    manual: number[];
    estimate: number[];
    total: number[]; // manual + estimate
  };
  stats: {
    dailyAverageTotal: number;
    dailyAverageManual: number;
    dailyAverageEstimate: number;
    bestDay: { dayKey: string; amount: number }; // highest total income day
    worstDay: { dayKey: string; amount: number }; // lowest total income day
  };
};