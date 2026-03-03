import { apiRequest } from "../../lib/api";

export type IncomeStatus = "confirmed" | "pending" | "ignored";
export type IncomeSource = "manual" | "import" | "estimate";

export type IncomeRow = {
  _id: string;
  name: string;
  date: string; // ISO
  amount: number; // dollars
  amountCents: number;
  status: IncomeStatus;
  source: IncomeSource;
  tags: string[];
};

export type IncomesCursorResponse = {
  data: IncomeRow[];
  nextCursor: string | null;
  hasMore: boolean;
  amounts?: {
    totalAmount: number;
  };
};

export type GetIncomesCursorParams = {
  cursor?: string;
  limit?: number;

  name?: string;
  source?: IncomeSource;

  from?: string;
  to?: string;

  sortBy?: string;
  sortOrder?: 1 | -1;
};

export type GetIncomesParams = {
  page?: number;
  limit?: number;

  name?: string;
  source?: IncomeSource | "all";

  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD

  sortBy?: "date" | "amount" | "name";
  sortOrder?: 1 | -1;
};

export type FullIncome = {
  _id: string;
  name: string;
  date: string;
  amountCents: number;
  amount: number;
  status: IncomeStatus;
  source: IncomeSource;
  tags: string[];
  notes?: string | null;

  addedBy: { _id: string; name: string; email: string };
  updatedBy: { _id: string; name: string; email: string };

  house: string;
  createdAt: string;
  updatedAt: string;
};

export type AddIncomePayload = {
  name: string;
  amount: number;
  date?: string;
  status?: IncomeStatus;
  source?: IncomeSource;
  tags?: string[];
  notes?: string;
};

export type EditIncomePayload = {
  name?: string;
  amount?: number;
  date?: string;
  status?: IncomeStatus;
  source?: IncomeSource;
  tags?: string[];
  notes?: string | null;
};

type ApiEnvelope<T> = {
  statusCode: number;
  message: string;
  data: T;
};

// RN-safe query string builder (no URLSearchParams dependency)
function toQueryString(params: Record<string, any>) {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  return parts.length ? `?${parts.join("&")}` : "";
}

export const IncomeApi = {
  getIncomesCursor(params: GetIncomesCursorParams = {}) {
    const qs = new URLSearchParams();

    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (typeof v === "string" && v.trim() === "") return;
      qs.set(k, String(v));
    });

    const path = qs.toString()
      ? `/income/incomes?${qs.toString()}`
      : "/income/incomes";

    return apiRequest<ApiEnvelope<IncomesCursorResponse>>("GET", path)
      .then((res) => res.data);
  },

  getSingleIncome(incomeId: string) {
    return apiRequest<ApiEnvelope<FullIncome>>("GET", `/income/income/${incomeId}`).then(
      (res) => res.data
    );
  },

  addIncome(payload: AddIncomePayload) {
    return apiRequest("POST", "/income/add", payload);
  },

  updateIncome(id: string, payload: EditIncomePayload) {
    return apiRequest("PUT", `/income/edit/${id}`, payload);
  },

  deleteIncome(id: string) {
    return apiRequest("DELETE", `/income/delete/${id}`);
  },
};