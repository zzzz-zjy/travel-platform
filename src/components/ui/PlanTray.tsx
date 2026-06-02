"use client";

import { useState } from "react";
import { usePlan } from "@/lib/plan-context";
import { useRouter } from "next/navigation";

const DAY_PRESETS = [1, 2, 3, 5, 7];
const BUDGET_PRESETS = [1000, 2000, 3000, 5000, 8000];
const STYLE_PRESETS = ["综合", "美食", "文化", "户外", "休闲"];

export default function PlanTray() {
  const { items, removeAttraction, clearAll } = usePlan();
  const router = useRouter();
  const [config, setConfig] = useState(false);
  const [days, setDays] = useState("3");
  const [budget, setBudget] = useState("3000");
  const [style, setStyle] = useState("综合");

  if (items.length === 0) return null;

  const ids = items.map((a) => a.id).join(",");

  const launch = () => {
    const d = parseInt(days) || 3;
    const b = parseInt(budget) || 3000;
    router.push(`/guide/new?attractions=${ids}&days=${d}&budget=${b}&style=${encodeURIComponent(style || "综合")}`);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 12px", borderRadius: 8,
    border: "1px solid #d1d5db", fontSize: 14, outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      position: "fixed", top: 72, right: 16, zIndex: 1000,
      width: 280, maxHeight: "calc(100vh - 100px)",
      background: "white", borderRadius: 12,
      boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid #e5e7eb",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>
          {config ? "⚙️ 行程设置" : `📋 行程清单 (${items.length})`}
        </span>
        {config ? (
          <button onClick={() => setConfig(false)} style={{
            background: "none", border: "none", color: "#9ca3af",
            fontSize: 12, cursor: "pointer",
          }}>返回</button>
        ) : (
          <button onClick={clearAll} style={{
            background: "none", border: "none", color: "#9ca3af",
            fontSize: 12, cursor: "pointer",
          }}>清空</button>
        )}
      </div>

      {config ? (
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              📅 计划玩几天
            </label>
            <input
              type="number" min={1} max={30}
              value={days} onChange={(e) => setDays(e.target.value)}
              placeholder="输入天数" style={inputStyle}
            />
            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
              {DAY_PRESETS.map((d) => (
                <button key={d} onClick={() => setDays(String(d))} style={{
                  padding: "2px 8px", borderRadius: 6, fontSize: 12,
                  border: days === String(d) ? "1px solid #2563eb" : "1px solid #e5e7eb",
                  background: days === String(d) ? "#eff6ff" : "white",
                  color: days === String(d) ? "#2563eb" : "#6b7280",
                  cursor: "pointer",
                }}>{d}天</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              💰 人均预算
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: 8, fontSize: 14, color: "#9ca3af" }}>¥</span>
              <input
                type="number" min={0} step={500}
                value={budget} onChange={(e) => setBudget(e.target.value)}
                placeholder="输入预算" style={{ ...inputStyle, paddingLeft: 28 }}
              />
            </div>
            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
              {BUDGET_PRESETS.map((b) => (
                <button key={b} onClick={() => setBudget(String(b))} style={{
                  padding: "2px 8px", borderRadius: 6, fontSize: 12,
                  border: budget === String(b) ? "1px solid #2563eb" : "1px solid #e5e7eb",
                  background: budget === String(b) ? "#eff6ff" : "white",
                  color: budget === String(b) ? "#2563eb" : "#6b7280",
                  cursor: "pointer",
                }}>¥{b >= 1000 ? b / 1000 + "k" : b}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              🎯 旅行风格
            </label>
            <input
              type="text"
              value={style} onChange={(e) => setStyle(e.target.value)}
              placeholder="如：亲子、蜜月、摄影..." style={inputStyle}
            />
            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
              {STYLE_PRESETS.map((s) => (
                <button key={s} onClick={() => setStyle(s)} style={{
                  padding: "2px 8px", borderRadius: 6, fontSize: 12,
                  border: style === s ? "1px solid #2563eb" : "1px solid #e5e7eb",
                  background: style === s ? "#eff6ff" : "white",
                  color: style === s ? "#2563eb" : "#6b7280",
                  cursor: "pointer",
                }}>{s}</button>
              ))}
            </div>
          </div>

          <button onClick={launch} style={{
            width: "100%", padding: "10px 0", borderRadius: 10,
            background: "#2563eb", color: "white", fontWeight: 700,
            fontSize: 14, border: "none", cursor: "pointer",
          }}>
            🚀 确认生成 ({items.length}个景点 · {days || "?"}天 · ¥{budget || "?"})
          </button>
        </div>
      ) : (
        <>
          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            {items.map((a) => (
              <div key={a.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 10px", borderRadius: 8,
                fontSize: 13, marginBottom: 4,
                background: "#f9fafb",
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.name}
                  </div>
                  <div style={{ color: "#9ca3af", fontSize: 11 }}>
                    {a.provinceName} · {a.cityName}
                  </div>
                </div>
                <button onClick={() => removeAttraction(a.id)} style={{
                  background: "none", border: "none", color: "#ef4444",
                  fontSize: 18, cursor: "pointer", padding: "2px 6px",
                  flexShrink: 0,
                }} title="移除">
                  ×
                </button>
              </div>
            ))}
          </div>

          <div style={{ padding: "10px 16px", borderTop: "1px solid #e5e7eb" }}>
            <button onClick={() => setConfig(true)} style={{
              width: "100%", padding: "10px 0", borderRadius: 10,
              background: "#2563eb", color: "white", fontWeight: 700,
              fontSize: 14, border: "none", cursor: "pointer",
            }}>
              ✨ AI 定制 ({items.length})
            </button>
          </div>
        </>
      )}
    </div>
  );
}
