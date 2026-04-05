// app/(admin)/users.tsx
"use client";

import DashboardShell from "@/src/modules/shell/DashboardShell";
import AdminUsersScreen from "@/src/modules/admin/AdminUsersScreen";

export default function AdminUsersPage() {
  return (
    <DashboardShell>
      <AdminUsersScreen />
    </DashboardShell>
  );
}