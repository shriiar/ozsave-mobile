import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 min
      gcTime: 1000 * 60 * 60 * 24, // 24h
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "OZSAVE_RQ_CACHE",
});

export async function initQueryPersistence() {
  await persistQueryClient({
    queryClient,
    persister,
    maxAge: 1000 * 60 * 60 * 24, // keep cache 24h
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        return query.state.status === "success";
      },
    },
  });
}