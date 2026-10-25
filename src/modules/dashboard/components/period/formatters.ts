import type { RangeKey, RangeOption } from "./types";

/** Keep palette stable across charts */
export const PIE_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#8b5cf6",
  "#ec4899",
];

/**
 * One cost/income/estimate color identity shared across the whole dashboard
 * (summary tiles, bar chart, breakdown-card deltas, billing planner). Red and
 * amber are picked to clear WCAG's 3:1 minimum for bold text against both a
 * near-white and a near-black card background; Apple's own flat system green
 * (#34C759) fails that on white, so `income` uses Apple's own Increased
 * Contrast green variant instead — still "Apple green," just the one made to
 * be read as text. `estimate` is deliberately not the app's primary orange
 * (#FF9500) — reusing a brand/action color for a data category would mean
 * one color meaning two different things.
 */
export const DASHBOARD_ACCENT = {
  cost: "#FF3B30",
  income: "#248A3D",
  estimate: "#B45309",
};

export const RANGE_OPTIONS: RangeOption[] = [
  { key: "7d", label: "Last 7 days", days: 7 },
  { key: "14d", label: "Last 14 days", days: 14 },
  { key: "30d", label: "Last 30 days", days: 30 },
];

/** -------- Dates (FIXED: local date, not UTC) -------- */
function localDayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey() {
  return localDayKey();
}

export function shiftDate(date: string, days: number) {
  // force local midnight parse
  const d = new Date(`${String(date)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date; // fail safe
  d.setDate(d.getDate() + days);
  return localDayKey(d);
}

export function formatDayLabel(dayKey: string) {
  const [y, m, d] = String(dayKey ?? "").split("-");
  if (!y || !m || !d) return String(dayKey ?? "");
  return `${m}/${d}`;
}

/** -------- Money helpers -------- */
export function money2(v: number) {
  const n = Number.isFinite(v) ? v : 0;
  return `$${n.toFixed(2)}`;
}

// use this for summary tiles, charts tooltips if you don't want cents
export function money0(v: number) {
  const n = Number.isFinite(v) ? v : 0;
  return `$${Math.round(n).toLocaleString()}`;
}

/** Chart Y-axis formatter (compact) */
export function formatAxisMoney(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "0";
  const abs = Math.abs(n);

  if (abs >= 1_000_000) return `${Math.round(n / 1_000_000)}M`;
  if (abs >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${Math.round(n)}`;
}

/** -------- API normalization --------
 * Handles:
 * 1) apiRequest returns { data: envelope }
 * 2) apiRequest returns envelope directly
 * 3) apiRequest returns payload directly
 */
export function normalizeApi(res: any) {
  const maybe = res?.data ?? res;
  const payload = maybe?.data ?? maybe;
  return payload;
}

/** -------- Severity (RN-ready: return colors, not Tailwind classes) -------- */
export function severityTone(sev?: "good" | "warn" | "bad") {
  if (sev === "good") {
    return { dotColor: "#34d399" }; // emerald-400
  }
  if (sev === "bad") {
    return { dotColor: "#f87171" }; // red-400
  }
  return { dotColor: "#fcd34d" }; // amber-300
}

/** Range meta */
export function rangeMetaOf(range: RangeKey) {
  return RANGE_OPTIONS.find((r) => r.key === range) ?? RANGE_OPTIONS[0];
}