"use client";

import { useRouter } from "next/navigation";
import { usePlan } from "./PlanContext";

export default function SelectionBar() {
  const router = useRouter();
  const { selectedSites, days, budget, sceneMode, clearAll } = usePlan();

  const handleGenerate = () => {
    const ids = selectedSites.map((s) => s.id).join(",");
    const params = new URLSearchParams();
    params.set("sites", ids);
    params.set("days", String(days));
    params.set("budget", String(budget));
    if (sceneMode) params.set("mode", sceneMode);
    router.push(`/journey/new?${params.toString()}`);
  };

  if (selectedSites.length === 0) return null;

  return (
    <div style={{
      position: "fixed", bottom: 56, left: "50%", transform: "translateX(-50%)",
      zIndex: 60, background: "white", borderRadius: 16,
      boxShadow: "0 4px 30px rgba(0,0,0,0.12)", padding: "12px 20px",
      display: "flex", alignItems: "center", gap: 16,
      border: "1px solid #f0e0d0", maxWidth: "90vw",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 22 }}>📍</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>
          已选 <span style={{ color: "#C41E3A" }}>{selectedSites.length}</span> 个旧址
        </span>
      </div>

      <div style={{ display: "flex", gap: 4, maxWidth: 300, overflow: "hidden" }}>
        {selectedSites.slice(0, 3).map((s) => (
          <span key={s.id} style={{
            background: "#FDF1F0", color: "#C41E3A", padding: "2px 8px",
            borderRadius: 9999, fontSize: 11, whiteSpace: "nowrap",
          }}>
            {s.name}
          </span>
        ))}
        {selectedSites.length > 3 && (
          <span style={{ fontSize: 11, color: "#999" }}>+{selectedSites.length - 3}</span>
        )}
      </div>

      <button onClick={clearAll} style={{
        background: "none", border: "none", color: "#999", fontSize: 12, cursor: "pointer",
      }}>
        清空
      </button>

      <button onClick={handleGenerate} style={{
        padding: "10px 24px", borderRadius: 10, border: "none",
        background: "linear-gradient(135deg, #C41E3A, #8B0000)",
        color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer",
        whiteSpace: "nowrap",
      }}>
        ✨ 生成研学路线
      </button>
    </div>
  );
}
