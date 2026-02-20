// src/components/PullToRefresh.tsx
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, ScrollViewProps } from "react-native";

type Props = ScrollViewProps & {
  onRefresh: () => Promise<void> | void;
};

export default function PullToRefresh({ onRefresh, children, ...props }: Props) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh, refreshing]);

  return (
    <ScrollView
      {...props}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {children}
    </ScrollView>
  );
}