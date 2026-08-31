import { apiRequest } from "../../lib/api";

/** ===== Types (mobile) ===== */

export type BillingFrequency = "weekly" | "monthly" | "yearly";

export enum CostCategory {
  groceries = "groceries",
  rent = "rent",
  utilities = "utilities",
  transport = "transport",
  private_transport = "private_transport",
  eating_out = "eating_out",
  shopping = "shopping",
  health = "health",
  entertainment = "entertainment",
  education = "education",
  subscriptions = "subscriptions",
  personal_care = "personal_care",
  insurance = "insurance",
  travel = "travel",
  other = "other",
}

export type BillingFilePayload = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
};

export type MemberSummary = {
  _id: string;
  name: string;
  email: string;
};

export type AddBillingPayload = {
  name: string;
  amount: number;
  category: CostCategory;
  frequency: BillingFrequency;
  startDate: string;
  endDate?: string;
  isActive?: boolean;
  paidBy: string;
  sharedBy: string[];
  files?: BillingFilePayload[];
  notes?: string;
};

export type EditBillingPayload = {
  name?: string;
  amount?: number;
  category?: CostCategory;
  endDate?: string | null;
  nextRunAt?: string;
  isActive?: boolean;
  paidBy?: string;
  sharedBy?: string[];
  files?: BillingFilePayload[];
  notes?: string;
};

export type BillingRow = {
  _id: string;
  name: string;
  amount: number;
  amountCents: number;
  frequency: BillingFrequency;
  startDate: string;
  nextRunAt: string;
  lastRunAt: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FullBilling = {
  _id: string;
  name: string;
  amount: number;
  amountCents: number;
  category: CostCategory;
  frequency: BillingFrequency;
  startDate: string;
  nextRunAt: string;
  lastRunAt: string | null;
  endDate: string | null;
  isActive: boolean;

  paidBy: string | MemberSummary;
  sharedBy: (string | MemberSummary)[];

  files?: BillingFilePayload[];
  notes?: string | null;

  house: string;
  addedBy: string | MemberSummary;
  updatedBy: string | MemberSummary;

  createdAt: string;
  updatedAt: string;
};

export type BillingsCursorResponse = {
  data: BillingRow[];
  nextCursor: string | null;
  hasMore: boolean;
};

type ApiEnvelope<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export type GetBillingsCursorParams = {
  cursor?: string;
  limit?: number;

  paidBy?: string;
  isOnlyUserBilling?: boolean;

  from?: string;
  to?: string;

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

export const BillingApi = {
  /**
   * Cursor pagination for mobile
   * GET /billing/billings?limit=10&cursor=...
   */
  getBillingsCursor(params: GetBillingsCursorParams = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => appendQS(qs, k, v));

    const path = qs.toString()
      ? `/billing/billings?${qs.toString()}`
      : "/billing/billings";

    return apiRequest<ApiEnvelope<BillingsCursorResponse>>("GET", path).then(
      (res) => res.data
    );
  },

  /**
   * GET /billing/billing/:billingId
   */
  getSingleBilling(billingId: string) {
    return apiRequest<ApiEnvelope<FullBilling>>(
      "GET",
      `/billing/billing/${billingId}`
    ).then((res) => res.data);
  },

  /**
   * POST /billing/add
   */
  addBilling(payload: AddBillingPayload) {
    return apiRequest<ApiEnvelope<FullBilling>>("POST", "/billing/add", payload).then(
      (res) => res.data
    );
  },

  /**
   * PUT /billing/edit/:billingId
   */
  updateBilling(id: string, payload: EditBillingPayload) {
    return apiRequest<ApiEnvelope<FullBilling>>(
      "PUT",
      `/billing/edit/${id}`,
      payload
    ).then((res) => res.data);
  },

  /**
   * DELETE /billing/delete/:billingId
   */
  deleteBilling(id: string) {
    return apiRequest<ApiEnvelope<null>>("DELETE", `/billing/delete/${id}`).then(
      (res) => res.data
    );
  },
};