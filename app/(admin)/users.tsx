// app/(admin)/users.tsx
"use client";

// Old pill nav bar shell — replaced by the native tab bar at app/(user)/_layout.tsx.
// Kept for reference/rollback, not currently used.
// import DashboardShell from "@/src/modules/shell/DashboardShell";
import AdminUsersScreen from "@/src/modules/admin/AdminUsersScreen";

export default function AdminUsersPage() {
  return <AdminUsersScreen />;
}