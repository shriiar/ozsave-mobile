// src/components/PullToRefresh.tsx
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, ScrollViewProps, Platform } from "react-native";
import { useTheme } from "../context/ThemeContext"; // adjust path if needed

type Props = ScrollViewProps & {
  onRefresh: () => Promise<void> | void;
};

export default function PullToRefresh({ onRefresh, children, ...props }: Props) {
  const [refreshing, setRefreshing] = useState(false);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const spinner = isDark ? "rgba(255,255,255,0.92)" : "rgba(15,23,42,0.85)";
  const androidBg = isDark ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.9)";

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
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="red"                 // iOS
          colors={["red"]}                  // Android
          progressBackgroundColor={androidBg} // Android
        />
      }
    >
      {children}
    </ScrollView>
  );
}