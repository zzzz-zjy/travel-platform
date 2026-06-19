"use client";

import dynamic from "next/dynamic";

const PlanMap = dynamic(() => import("@/components/plan/PlanMap"), {
  ssr: false,
  loading: () => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100%", background: "#FDF8F0", borderRadius: 12,
      color: "#8B0000", fontSize: 16,
    }}>加载地图中...</div>
  ),
});

export default function PlanMapWrapper() {
  return <PlanMap />;
}
