import { useEffect, useMemo } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { invalidateDashboard } from "../../dashboard/hooks/hook";
import { useScreenActive } from "../../../hooks/useScreenActive";

import {
  AddIncomePayload,
  EditIncomePayload,
  FullIncome,
  GetIncomesCursorParams,
  GetIncomesParams,
  IncomeApi,
} from "../api";

/** keep your existing useIncomes/useIncome if you still want them */
export function useInfiniteIncomes(params: Omit<GetIncomesCursorParams, "cursor">) {
  const queryClient = useQueryClient();
  const { isActiveScreen } = useScreenActive();

  const keyParams = useMemo(
    () => ({
      limit: params.limit ?? 10,
      name: params.name,
      source: params.source,
      from: params.from,
      to: params.to,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    }),
    [
      params.limit,
      params.name,
      params.source,
      params.from,
      params.to,
      params.sortBy,
      params.sortOrder,
    ]
  );

  const query = useInfiniteQuery({
    queryKey: ["incomes-infinite", keyParams],
    initialPageParam: undefined as string | undefined,

    queryFn: ({ pageParam }) =>
      IncomeApi.getIncomesCursor({
        ...keyParams,
        cursor: pageParam,
      }),

    getNextPageParam: (lastPage: any) =>
      lastPage?.hasMore ? lastPage.nextCursor ?? undefined : undefined,

    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,

    staleTime: 10_000,
    gcTime: 30 * 60_000,
  });

  const STALE_MS = 5 * 60_000;

  useEffect(() => {
    if (!isActiveScreen) return;

    // first entry: let initial fetch happen naturally
    if (!query.data) return;

    // only refetch if older than 5 minutes
    const age = Date.now() - (query.dataUpdatedAt ?? 0);
    if (age >= STALE_MS) {
      query.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActiveScreen]);

  // Flatten pages -> items (AND DEDUPE like you did in screen)
  const items = useMemo(() => {
    const pages = query.data?.pages ?? [];
    const all = pages.flatMap((p: any) => p?.data ?? []);

    const map = new Map<string, any>();
    for (const r of all) map.set(String(r._id), r);
    return Array.from(map.values());
  }, [query.data?.pages]);

  const lastPage = query.data?.pages?.[query.data.pages.length - 1];
  const nextCursor = lastPage?.nextCursor ?? null;
  const hasMore = lastPage?.hasMore ?? false;

  return {
    ...query,
    items,
    nextCursor,
    hasMore,

    loadMore: () => {
      if (query.isFetchingNextPage) return;
      if (!hasMore) return;
      query.fetchNextPage();
    },

    refreshTop: async () => {
      await queryClient.removeQueries({
        queryKey: ["incomes-infinite", keyParams],
        exact: true,
      });
      await query.refetch();
    },
  };
}

export function useIncome(incomeId: string | null, enabled: boolean) {
  return useQuery<FullIncome>({
    queryKey: ["income", incomeId],
    enabled: enabled && !!incomeId,
    queryFn: async () => {
      if (!incomeId) throw new Error("Missing incomeId");
      return IncomeApi.getSingleIncome(incomeId);
    },
  });
}

/* -------- MUTATIONS (update invalidations) -------- */

export function useAddIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddIncomePayload) => IncomeApi.addIncome(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["incomes"], exact: false }),
        queryClient.invalidateQueries({ queryKey: ["incomes-infinite"], exact: false }),
        invalidateDashboard(queryClient),
      ]);
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; payload: EditIncomePayload }) =>
      IncomeApi.updateIncome(input.id, input.payload),
    onSuccess: async (_res, vars) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["incomes"], exact: false }),
        queryClient.invalidateQueries({ queryKey: ["incomes-infinite"], exact: false }),
        queryClient.invalidateQueries({ queryKey: ["income", vars.id], exact: true }),
        invalidateDashboard(queryClient),
      ]);
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => IncomeApi.deleteIncome(id),
    onSuccess: async (_res, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["incomes"], exact: false }),
        queryClient.invalidateQueries({ queryKey: ["incomes-infinite"], exact: false }),
        invalidateDashboard(queryClient),
        queryClient.removeQueries({ queryKey: ["income", id], exact: true }),
      ]);
    },
  });
}