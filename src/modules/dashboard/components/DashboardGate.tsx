// src/modules/dashboard/components/DashboardGate.tsx
import React from "react";
import { useAuth } from "../../../context/AuthContext";
import DashboardSkeleton from "./DashboardSkeleton"; 
import GetStarted from "./GetStarted";
import DashboardProvider from "./DashboardProvider";

export default function DashboardGate() {
  const { user, loading } = useAuth();

  if (loading) return <DashboardSkeleton />;

  if (!user?.house) return <GetStarted />;

  return <DashboardProvider house={user.house} />;
}