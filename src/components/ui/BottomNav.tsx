"use client";

import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { path: "/plan", label: "研学规划", icon: "🗺️" },
  { path: "/explore", label: "地图", icon: "🌏" },
  { path: "/narrator", label: "AI讲解员", icon: "🤖" },
  { path: "/journeys", label: "研学广场", icon: "📋" },
  { path: "/my", label: "我的", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
      background: "white", borderTop: "1px solid #e5e7eb",
      display: "flex", justifyContent: "space-around", padding: "8px 0",
    }}>
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              background: "none", border: "none", cursor: "pointer",
              color: active ? "var(--color-primary-light)" : "#6b7280",
              fontSize: 12, gap: 4,
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontWeight: active ? 600 : 400 }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
