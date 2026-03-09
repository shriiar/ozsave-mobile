import { useEffect, useMemo } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  BillingApi,
  GetBillingsCursorParams,
  AddBillingPayload,
  EditBillingPayload,
  BillingRow
} from "../api";

import { invalidateDashboard } from "../../dashboard/hooks/hook";
import { useScreenActive } from "../../../hooks/useScreenActive";


export type BillingCursorResponse = {
  data: BillingRow[];
  nextCursor: string | null;
  hasMore: boolean;
};


/**
 * MOBILE BILLINGS
 * Cursor infinite scroll
 */
export function useInfiniteBillings(params: Omit<GetBillingsCursorParams, "cursor">) {

  const queryClient = useQueryClient();
  const { isActiveScreen } = useScreenActive();

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

  const query = useInfiniteQuery({

    queryKey: ["billings-infinite", keyParams],

    initialPageParam: undefined as string | undefined,

    queryFn: ({ pageParam }) =>
      BillingApi.getBillingsCursor({
        ...keyParams,
        cursor: pageParam,
      }) as Promise<BillingCursorResponse>,

    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? lastPage.nextCursor ?? undefined : undefined,

    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,

    staleTime: 10_000,
    gcTime: 30 * 60_000,
  });


  /** screen focus refresh logic */

  const STALE_MS = 5 * 60_000;

  useEffect(() => {

    if (!isActiveScreen) return;
    if (!query.data) return;

    const age = Date.now() - (query.dataUpdatedAt ?? 0);

    if (age >= STALE_MS) {
      query.refetch();
    }

  }, [isActiveScreen]);


  /** flatten pages */

  const items = useMemo(() => {

    const pages = query.data?.pages ?? [];
    return pages.flatMap(p => p?.data ?? []);

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
        queryKey: ["billings-infinite", keyParams],
        exact: true,
      });

      await query.refetch();
    }

  };
}



export function useAddBilling() {

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: (payload: AddBillingPayload) =>
      BillingApi.addBilling(payload),

    onSuccess: async () => {

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["billings-infinite"] }),
        invalidateDashboard(queryClient),
      ]);

    }

  });

}



export function useUpdateBilling() {

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: (input: { id: string; payload: EditBillingPayload }) =>
      BillingApi.updateBilling(input.id, input.payload),

    onSuccess: async () => {

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["billings-infinite"] }),
        invalidateDashboard(queryClient),
      ]);

    }

  });

}



export function useDeleteBilling() {

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: (id: string) =>
      BillingApi.deleteBilling(id),

    onSuccess: async () => {

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["billings-infinite"] }),
        invalidateDashboard(queryClient),
      ]);

    }

  });

}