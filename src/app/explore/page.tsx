"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const ChinaMapScene = dynamic(() => import("@/components/china-map/ChinaMapScene"), {
  ssr: false,
  loading: () => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", background: "#0a0202",
      color: "#D4A574", fontSize: 16,
    }}>加载中...</div>
  ),
});

export default function ExplorePage() {
  return (
    <div style={{ position: "relative", height: "calc(100vh - 48px - 56px)" }}>
      <ChinaMapScene />
      <div style={{
        position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
        zIndex: 20, display: "flex", gap: 8,
      }}>
        <Link href="/plan" style={{
          padding: "10px 24px", borderRadius: 10,
          background: "linear-gradient(135deg, #C41E3A, #8B0000)",
          color: "white", fontSize: 14, fontWeight: 600,
          textDecoration: "none", boxShadow: "0 4px 20px rgba(196,30,58,0.4)",
        }}>
          📍 研学规划
        </Link>
      </div>
    </div>
  );
}
