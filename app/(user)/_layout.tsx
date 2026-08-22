// app/(user)/_layout.tsx
import AppTabsLayout from "../../src/modules/shell/AppTabsLayout";

export default AppTabsLayout;

// ---------------------------------------------------------------------------
// OLD LAYOUT — custom pill nav bar (DashboardShell), kept for reference/
// rollback. Not currently used; the active layout above renders the native
// iOS tab bar instead (src/modules/shell/AppTabsLayout.tsx).
// ---------------------------------------------------------------------------
//
// import React from "react";
// import { Stack } from "expo-router";
// import DashboardShell from "../../src/modules/shell/DashboardShell";
// import { useTheme } from "../../src/context/ThemeContext";
//
// export default function UserLayout() {
//   const { resolvedTheme } = useTheme();
//
//   return (
//     <DashboardShell>
//       <Stack
//         screenOptions={{
//           headerShown: false,
//           contentStyle: { backgroundColor: resolvedTheme === "dark" ? "#0a0a0a" : "#ffffff" },
//         }}
//       />
//     </DashboardShell>
//   );
// }
