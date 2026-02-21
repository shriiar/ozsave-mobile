// src/modules/cost/api.ts
import { apiRequest } from "../../lib/api";

/** ===== Types (mobile) ===== */

export type CostFilePayload = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
};

export type CostItemPayload = {
  name: string;
  amount: number;
  category: string;
  paidBy: string;
  sharedBy: string[];
  date?: string; // ISO
  files?: CostFilePayload[];
  notes?: string;
};

export type AddCostPayload = {
  categorized: boolean;
  costs: CostItemPayload[];
};

export type CostRow = {
  _id: string;
  name: string;
  date: string; // ISO
  amount: number;
  amountCents: number;
  userShare: number;
};

export type CostsCursorResponse = {
  data: CostRow[];
  nextCursor: string | null;
  hasMore: boolean;
};

type ApiEnvelope<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export type GetCostsCursorParams = {
  cursor?: string; // last _id
  limit?: number; // page size

  paidBy?: string;
  isOnlyUserCost?: boolean;

  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD

  // ignore these in cursor mode on backend (fine if client sends)
  sortBy?: string;
  sortOrder?: 1 | -1;
};

function appendQS(qs: URLSearchParams, key: string, value: unknown) {
  if (value === undefined || value === null) return;
  if (typeof value === "string" && value.trim() === "") return;

  if (typeof value === "boolean") {
    qs.set(key, value ? "true" : "false");
    return;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return;
    qs.set(key, String(value));
    return;
  }

  qs.set(key, String(value));
}

/** ===== API ===== */

export const CostApi = {
  /**
   * ✅ Cursor pagination (mobile)
   * GET /cost/costs?limit=10&cursor=...
   */
  getCostsCursor(params: GetCostsCursorParams = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => appendQS(qs, k, v));

    const path = qs.toString() ? `/cost/costs?${qs.toString()}` : "/cost/costs";
    return apiRequest<ApiEnvelope<CostsCursorResponse>>("GET", path).then((r) => r.data);
  },

  /**
   * ✅ Create cost(s)
   * POST /cost/add
   */
  addCost(payload: AddCostPayload) {
    return apiRequest("POST", "/cost/add", payload);
  },

  /**
   * ✅ Update single cost
   * PUT /cost/edit/:id
   */
  updateCost(id: string, payload: Partial<Omit<CostItemPayload, "files">> & { notes?: string }) {
    return apiRequest("PUT", `/cost/edit/${id}`, payload);
  },

  /**
   * ✅ Delete single cost
   * DELETE /cost/delete/:id
   */
  deleteCost(id: string) {
    return apiRequest("DELETE", `/cost/delete/${id}`);
  },
};