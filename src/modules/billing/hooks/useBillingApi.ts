import { useEffect, useMemo } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  BillingApi,
  GetBillingsCursorParams,
  BillingsCursorResponse,
  AddBillingPayload,
  EditBillingPayload,
  FullBilling,
} from "../api";

import { invalidateDashboard } from "../../dashboard/hooks/hook";
import { useScreenActive } from "../../../hooks/useScreenActive";

/**
 * ✅ MOBILE ONLY
 * Cursor pagination (infinite scroll)
 *
 * Backend:
 *  GET /billing/billings?limit=10&cursor=...
 *
 * Response:
 *  { data: BillingRow[], nextCursor: string|null, hasMore: boolean }
 */
export function useInfiniteBillings(
  params: Omit<GetBillingsCursorParams, "cursor">
) {
  const queryClient = useQueryClient();
  const { isActiveScreen } = useScreenActive();

  // Keep queryKey stable
  const keyParams = useMemo(
    () => ({
      limit: params.limit ?? 10,
      paidBy: params.paidBy,
      isOnlyUserBilling: params.isOnlyUserBilling,
      from: params.from,
      to: params.to,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    }),
    [
      params.limit,
      params.paidBy,
      params.isOnlyUserBilling,
      params.from,
      params.to,
      params.sortBy,
      params.sortOrder,
    ]
  );

  // Keep this in sync with `staleTime` below — react-query's own automatic
  // refetchOnMount fires whenever data is older than `staleTime`, on every
  // query re-subscription (e.g. every tab switch), independent of the
  // useScreenActive-gated effect further down. A short staleTime here would
  // silently refetch on every route change regardless of that 5-minute gate.
  const STALE_MS = 5 * 60_000;

  const query = useInfiniteQuery({
    queryKey: ["billings-infinite", keyParams],
    initialPageParam: undefined as string | undefined,

    queryFn: ({ pageParam }) =>
      BillingApi.getBillingsCursor({
        ...keyParams,
        cursor: pageParam,
      }),

    getNextPageParam: (lastPage: BillingsCursorResponse) =>
      lastPage?.hasMore ? lastPage.nextCursor ?? undefined : undefined,

    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,

    staleTime: STALE_MS,
    gcTime: 30 * 60_000,
  });

  /**
   * Refresh when screen becomes active again,
   * but only if cache is old enough.
   */
  useEffect(() => {
    if (!isActiveScreen) return;

    // first open: let normal initial fetch happen
    if (!query.data) return;

    const age = Date.now() - (query.dataUpdatedAt ?? 0);
    if (age >= STALE_MS) {
      query.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActiveScreen]);

  // Flatten pages
  const items = useMemo(() => {
    const pages = query.data?.pages ?? [];
    return pages.flatMap((p) => p?.data ?? []);
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
      queryClient.setQueryData(["billings-infinite", keyParams], (old: any) => {
        if (!old?.pages?.length) return old;

        return {
          ...old,
          pages: [old.pages[0]],
          pageParams: old.pageParams?.length ? [old.pageParams[0]] : old.pageParams,
        };
      });

      await query.refetch();
    },
  };
}

export function useBilling(billingId: string | null, open?: boolean) {
  return useQuery<FullBilling>({
    queryKey: ["billing", billingId],
    enabled: !!billingId && (open ?? true),
    queryFn: async () => {
      if (!billingId) throw new Error("Missing billingId");
      return BillingApi.getSingleBilling(billingId);
    },
    staleTime: 0,
  });
}

export function useAddBilling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddBillingPayload) => BillingApi.addBilling(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["billings-infinite"],
          exact: false,
        }),
        invalidateDashboard(queryClient),
      ]);
    },
  });
}

export function useUpdateBilling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; payload: EditBillingPayload }) =>
      BillingApi.updateBilling(input.id, input.payload),

    onSuccess: async (_res, vars) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["billings-infinite"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["billing", vars.id],
        }),
        invalidateDashboard(queryClient),
      ]);
    },
  });
}

export function useDeleteBilling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => BillingApi.deleteBilling(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["billings-infinite"],
          exact: false,
        }),
        invalidateDashboard(queryClient),
      ]);
    },
  });
}