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



// import React from "react";
// import { DynamicColorIOS } from "react-native";
// import { NativeTabs } from "expo-router/unstable-native-tabs";

// export default function UserLayout() {
//   return (
//     <NativeTabs
//       blurEffect="systemChromeMaterial"
//       iconColor={{
//         default: DynamicColorIOS({
//           light: "#64748B",
//           dark: "#94A3B8",
//         }),
//         selected: DynamicColorIOS({
//           light: "#0F172A",
//           dark: "#FFFFFF",
//         }),
//       }}
//       labelStyle={{
//         color: DynamicColorIOS({
//           light: "#0F172A",
//           dark: "#FFFFFF",
//         }),
//       }}
//     >
//       <NativeTabs.Trigger name="dashboard">
//         <NativeTabs.Trigger.Icon
//           sf={{ default: "house", selected: "house.fill" }}
//           md="home"
//         />
//         <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
//       </NativeTabs.Trigger>

//       <NativeTabs.Trigger name="cost">
//         <NativeTabs.Trigger.Icon
//           sf={{ default: "receipt", selected: "receipt.fill" }}
//           md="receipt_long"
//         />
//         <NativeTabs.Trigger.Label>Costs</NativeTabs.Trigger.Label>
//       </NativeTabs.Trigger>

//       <NativeTabs.Trigger name="income">
//         <NativeTabs.Trigger.Icon
//           sf={{ default: "wallet.pass", selected: "wallet.pass.fill" }}
//           md="account_balance_wallet"
//         />
//         <NativeTabs.Trigger.Label>Income</NativeTabs.Trigger.Label>
//       </NativeTabs.Trigger>

//       <NativeTabs.Trigger name="billing">
//         <NativeTabs.Trigger.Icon
//           sf={{ default: "creditcard", selected: "creditcard.fill" }}
//           md="credit_card"
//         />
//         <NativeTabs.Trigger.Label>Billing</NativeTabs.Trigger.Label>
//       </NativeTabs.Trigger>
//     </NativeTabs>
//   );
// }