// src/modules/cost/hooks/useCostApi.ts
import { useEffect, useMemo } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  CostApi,
  GetCostsCursorParams,
  CostsCursorResponse,
  AddCostPayload,
  CostItemPayload,
} from "../api";

import { invalidateDashboard } from "../../dashboard/hooks/hook";
import { useScreenActive } from "../../../hooks/useScreenActive";

/**
 * ✅ MOBILE ONLY
 * Cursor pagination (infinite scroll)
 *
 * Backend:
 *  GET /cost/costs?limit=10&cursor=<lastId>
 *
 * Response:
 *  { data: CostRow[], nextCursor: string|null, hasMore: boolean }
 */
export function useInfiniteCosts(params: Omit<GetCostsCursorParams, "cursor">) {
  const queryClient = useQueryClient();
  const { isActiveScreen } = useScreenActive();

  // Keep queryKey stable (avoid new object identity surprises)
  const keyParams = useMemo(
    () => ({
      limit: params.limit ?? 10,
      paidBy: params.paidBy,
      isOnlyUserCost: params.isOnlyUserCost,
      from: params.from,
      to: params.to,

      // NOTE: cursor mode should ignore sortBy/sortOrder on backend,
      // but we keep them here in case you still pass them.
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    }),
    [
      params.limit,
      params.paidBy,
      params.isOnlyUserCost,
      params.from,
      params.to,
      params.sortBy,
      params.sortOrder,
    ]
  );

  const query = useInfiniteQuery({
    queryKey: ["costs-infinite", keyParams],
    initialPageParam: undefined as string | undefined,

    queryFn: ({ pageParam }) =>
      CostApi.getCostsCursor({
        ...keyParams,
        cursor: pageParam, // ✅ IMPORTANT: this is how cursor gets passed
      }),

    getNextPageParam: (lastPage: CostsCursorResponse) =>
      lastPage?.hasMore ? lastPage.nextCursor ?? undefined : undefined,

    // no polling by default for costs
    refetchInterval: false,
    refetchIntervalInBackground: false,

    // don’t auto-refetch on random focus events (we control it via useScreenActive)
    refetchOnWindowFocus: false,

    staleTime: 10_000,
    gcTime: 30 * 60_000,
  });

  /**
   * ✅ “Real app” behavior:
   * When the screen becomes active again (focused + foreground),
   * refresh the first page (cleanly).
   *
   * In v5: NO query.remove(). Use queryClient.removeQueries().
   */
  const STALE_MS = 5 * 60_000;

  useEffect(() => {
    if (!isActiveScreen) return;

    // ✅ First time screen opens: let the normal initial fetch happen
    if (!query.data) return;

    // ✅ Only refetch if cache is older than 5 minutes
    const age = Date.now() - (query.dataUpdatedAt ?? 0);
    if (age >= STALE_MS) {
      query.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActiveScreen]);

  // Flatten pages -> items
  const items = useMemo(() => {
    const pages = query.data?.pages ?? [];
    return pages.flatMap((p) => p?.data ?? []);
  }, [query.data?.pages]);

  const lastPage = query.data?.pages?.[query.data.pages.length - 1];
  const nextCursor = lastPage?.nextCursor ?? null;
  const hasMore = lastPage?.hasMore ?? false;

  return {
    // react-query
    ...query,

    // convenience
    items,
    nextCursor,
    hasMore,

    // infinite scroll helpers
    loadMore: () => {
      if (query.isFetchingNextPage) return;
      if (!hasMore) return;
      query.fetchNextPage();
    },

    // pull-to-refresh style helper
    refreshTop: async () => {
      await queryClient.removeQueries({
        queryKey: ["costs-infinite", keyParams],
        exact: true,
      });
      await query.refetch();
    },
  };
}

/* ---------------- MUTATIONS ----------------
 * Keep names same.
 * If your mobile repo does NOT have add/edit/delete endpoints wired yet,
 * comment these out to avoid TS errors.
 */

export function useAddCost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddCostPayload) => CostApi.addCost(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["costs-infinite"], exact: false }),
        invalidateDashboard(queryClient),
      ]);
    },
  });
}

export function useUpdateCost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; payload: Partial<Omit<CostItemPayload, "files">> & { notes?: string } }) =>
      CostApi.updateCost(input.id, input.payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["costs-infinite"], exact: false }),
        invalidateDashboard(queryClient),
      ]);
    },
  });
}

export function useDeleteCost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CostApi.deleteCost(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["costs-infinite"], exact: false }),
        invalidateDashboard(queryClient),
      ]);
    },
  });
}