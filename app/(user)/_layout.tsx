// app/(user)/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import DashboardShell from "../../src/modules/shell/DashboardShell";

export default function UserLayout() {
  return (
    <DashboardShell>
      <Stack screenOptions={{ headerShown: false }} />
    </DashboardShell>
  );
}