"use client";

import { usePlan } from "@/lib/plan-context";
import { useRouter } from "next/navigation";

export default function AttractionActions({
  attraction,
}: {
  attraction: {
    id: number;
    name: string;
    cityName: string;
    provinceName: string;
  };
}) {
  const { items, addAttraction, removeAttraction } = usePlan();
  const router = useRouter();
  const added = items.some((x) => x.id === attraction.id);

  const toggle = () => {
    if (added) {
      removeAttraction(attraction.id);
    } else {
      addAttraction({
        id: attraction.id,
        name: attraction.name,
        cityName: attraction.cityName,
        provinceName: attraction.provinceName,
      });
    }
  };

  return (
    <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
      <button onClick={toggle} style={{
        padding: "12px 24px", borderRadius: 12, fontWeight: "bold",
        border: added ? "1px solid #ef4444" : "1px solid #2563eb",
        background: added ? "#fef2f2" : "#eff6ff",
        color: added ? "#ef4444" : "#2563eb",
        fontSize: 15, cursor: "pointer",
      }}>
        {added ? "✓ 已加入行程" : "➕ 加入行程"}
      </button>

      <button onClick={() => router.push(`/guide/new?attraction=${attraction.id}`)} style={{
        padding: "12px 24px", borderRadius: 12, fontWeight: "bold",
        border: "none", background: "#2563eb", color: "white",
        fontSize: 15, cursor: "pointer",
      }}>
        ✨ AI 定制包含此景点
      </button>

      {items.length > 1 && (
        <button onClick={() => {
          const ids = items.map((a) => a.id).join(",");
          router.push(`/guide/new?attractions=${ids}`);
        }} style={{
          padding: "12px 24px", borderRadius: 12, fontWeight: "bold",
          border: "none", background: "#7c3aed", color: "white",
          fontSize: 15, cursor: "pointer",
        }}>
          🗺️ AI 定制全部行程 ({items.length})
        </button>
      )}
    </div>
  );
}
