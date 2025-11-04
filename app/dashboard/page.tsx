import Dashboard from "../components/Dashboard";
import { Suspense } from "react";

export default function DashboardPage() {
  return <Suspense fallback={null}><Dashboard /></Suspense>;
}
