"use client";

import dynamic from "next/dynamic";

const ChinaMapScene = dynamic(() => import("@/components/china-map/ChinaMapScene"), {
  ssr: false,
  loading: () => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100%", background: "#0a0202",
      color: "#D4A574", fontSize: 16,
    }}>加载地图中...</div>
  ),
});

export default function ChinaMapWrapper() {
  return <ChinaMapScene />;
}
