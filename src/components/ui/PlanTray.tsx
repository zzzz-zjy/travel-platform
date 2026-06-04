"use client";

import { useState } from "react";
import { usePlan } from "@/lib/plan-context";
import { useRouter } from "next/navigation";
import { SCENARIOS, getScenario } from "@/lib/scenarios";

const DAY_PRESETS = [1, 2, 3, 5, 7];
const BUDGET_PRESETS = [1000, 2000, 3000, 5000, 8000];
const STYLE_PRESETS = ["综合", "美食", "文化", "户外", "休闲"];

const TRAVELERS = [
  { key: "solo", label: "🧑 单人", desc: "" },
  { key: "couple", label: "💑 情侣", desc: "" },
  { key: "family", label: "👨‍👩‍👧 亲子", desc: "" },
  { key: "elderly", label: "🧓 银发", desc: "" },
  { key: "friends", label: "👫 结伴", desc: "" },
];

const DIET_RESTRICTIONS = [
  { key: "none", label: "无" },
  { key: "vegetarian", label: "🥬 素食" },
  { key: "halal", label: "🥩 清真" },
  { key: "allergy", label: "⚠️ 过敏" },
];

const ACCOMMODATIONS = [
  { key: "budget", label: "🏨 经济型" },
  { key: "mid", label: "🏩 舒适型" },
  { key: "high", label: "🏰 豪华型" },
];

export default function PlanTray() {
  const { items, removeAttraction, clearAll } = usePlan();
  const router = useRouter();
  const [config, setConfig] = useState(false);
  const [days, setDays] = useState("3");
  const [budget, setBudget] = useState("3000");
  const [style, setStyle] = useState("综合");
  const [traveler, setTraveler] = useState("solo");
  const [diet, setDiet] = useState<string[]>([]);
  const [pace, setPace] = useState(50);
  const [accommodation, setAccommodation] = useState("mid");

  if (items.length === 0) return null;

  const ids = items.map((a) => a.id).join(",");

  const toggleDiet = (key: string) => {
    setDiet((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const applyScenario = (key: string) => {
    const s = getScenario(key);
    if (!s) return;
    if (s.defaults.budget) setBudget(String(s.defaults.budget));
    if (s.defaults.transport) {
      if (s.defaults.transport.includes("自驾")) setPace(25);
      if (s.defaults.transport.includes("公共交通")) setPace(50);
    }
    if (s.defaults.style) setStyle(s.defaults.style);
    if (s.key === "budget") setAccommodation("budget");
    if (s.key === "overseas") setAccommodation("mid");
    if (s.key === "senior") { setPace(75); setAccommodation("high"); }
  };

  const launch = () => {
    const d = parseInt(days) || 3;
    const b = parseInt(budget) || 3000;
    const paceLabel = pace < 35 ? "紧凑" : pace > 65 ? "松弛" : "适中";
    const fullStyle = [style, paceLabel].filter(Boolean).join("·");
    const travelerLabel = TRAVELERS.find((t) => t.key === traveler)?.label.replace(/[^一-龥]/g, "") || "";
    const dietStr = diet.filter((d) => d !== "none").join("/");
    const extraParams = [
      `traveler=${encodeURIComponent(travelerLabel)}`,
      dietStr ? `diet=${encodeURIComponent(dietStr)}` : "",
      `accommodation=${encodeURIComponent(accommodation)}`,
      `pace=${paceLabel}`,
    ].filter(Boolean).join("&");

    router.push(`/guide/new?attractions=${ids}&days=${d}&budget=${b}&style=${encodeURIComponent(fullStyle)}&${extraParams}`);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 12px", borderRadius: 8,
    border: "1px solid #d1d5db", fontSize: 14, outline: "none",
    boxSizing: "border-box",
  };

  const tagStyle = (active: boolean): React.CSSProperties => ({
    padding: "5px 10px", borderRadius: 6, fontSize: 12,
    border: active ? "1px solid #2563eb" : "1px solid #e5e7eb",
    background: active ? "#eff6ff" : "white",
    color: active ? "#2563eb" : "#6b7280",
    cursor: "pointer", fontWeight: active ? 600 : 400,
    transition: "all 0.15s",
  });

  const sectionLabel: React.CSSProperties = {
    fontSize: 13, fontWeight: 700, color: "#374151",
    display: "block", marginBottom: 6,
  };

  return (
    <div style={{
      position: "fixed", top: 72, right: 16, zIndex: 1000,
      width: 300, maxHeight: "calc(100vh - 100px)",
      background: "white", borderRadius: 12,
      boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid #e5e7eb",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>
          {config ? "⚙️ 偏好设置" : `📋 行程清单 (${items.length})`}
        </span>
        {config ? (
          <button onClick={() => setConfig(false)} style={{
            background: "none", border: "none", color: "#9ca3af",
            fontSize: 12, cursor: "pointer",
          }}>← 返回</button>
        ) : (
          <button onClick={clearAll} style={{
            background: "none", border: "none", color: "#9ca3af",
            fontSize: 12, cursor: "pointer",
          }}>清空</button>
        )}
      </div>

      {config ? (
        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* 场景快捷选择 */}
          <div>
            <span style={sectionLabel}>🎯 场景模式</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {SCENARIOS.map((s) => (
                <button key={s.key} onClick={() => applyScenario(s.key)}
                  style={{
                    padding: "4px 8px", borderRadius: 6, fontSize: 11,
                    border: "1px solid #e5e7eb", background: "white",
                    color: "#6b7280", cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  title={s.desc}
                >
                  {s.icon} {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* 出行人数 */}
          <div>
            <span style={sectionLabel}>👥 出行人数</span>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {TRAVELERS.map((t) => (
                <button key={t.key} onClick={() => setTraveler(t.key)}
                  style={tagStyle(traveler === t.key)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 出行天数 */}
          <div>
            <span style={sectionLabel}>📅 计划玩几天</span>
            <input type="number" min={1} max={30}
              value={days} onChange={(e) => setDays(e.target.value)}
              placeholder="输入天数" style={inputStyle}
            />
            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
              {DAY_PRESETS.map((d) => (
                <button key={d} onClick={() => setDays(String(d))}
                  style={tagStyle(days === String(d))}>{d}天</button>
              ))}
            </div>
          </div>

          {/* 人均预算 */}
          <div>
            <span style={sectionLabel}>💰 人均预算</span>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: 8, fontSize: 14, color: "#9ca3af" }}>¥</span>
              <input type="number" min={0} step={500}
                value={budget} onChange={(e) => setBudget(e.target.value)}
                placeholder="输入预算" style={{ ...inputStyle, paddingLeft: 28 }}
              />
            </div>
            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
              {BUDGET_PRESETS.map((b) => (
                <button key={b} onClick={() => setBudget(String(b))}
                  style={tagStyle(budget === String(b))}>
                  ¥{b >= 1000 ? b / 1000 + "k" : b}
                </button>
              ))}
            </div>
          </div>

          {/* 旅行风格 */}
          <div>
            <span style={sectionLabel}>🎯 旅行风格</span>
            <input type="text"
              value={style} onChange={(e) => setStyle(e.target.value)}
              placeholder="如：亲子、蜜月、摄影..." style={inputStyle}
            />
            <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
              {STYLE_PRESETS.map((s) => (
                <button key={s} onClick={() => setStyle(s)}
                  style={tagStyle(style === s)}>{s}</button>
              ))}
            </div>
          </div>

          {/* 饮食限制 */}
          <div>
            <span style={sectionLabel}>🍽️ 饮食限制</span>
            <div style={{ display: "flex", gap: 4 }}>
              {DIET_RESTRICTIONS.map((d) => (
                <button key={d.key} onClick={() => toggleDiet(d.key)}
                  style={tagStyle(diet.includes(d.key))}>{d.label}</button>
              ))}
            </div>
          </div>

          {/* 节奏偏好 */}
          <div>
            <span style={sectionLabel}>
              🏃 行程节奏：
              <span style={{ color: pace < 35 ? "#dc2626" : pace > 65 ? "#059669" : "#2563eb", fontWeight: 700 }}>
                {pace < 35 ? "紧凑打卡" : pace > 65 ? "休闲松弛" : "适中节奏"}
              </span>
            </span>
            <input type="range" min={0} max={100} value={pace}
              onChange={(e) => setPace(Number(e.target.value))}
              style={{ width: "100%", marginTop: 4, accentColor: "#2563eb" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9ca3af" }}>
              <span>🏃 紧凑</span><span>🚶 松弛</span>
            </div>
          </div>

          {/* 住宿档次 */}
          <div>
            <span style={sectionLabel}>🛏️ 住宿档次</span>
            <div style={{ display: "flex", gap: 4 }}>
              {ACCOMMODATIONS.map((a) => (
                <button key={a.key} onClick={() => setAccommodation(a.key)}
                  style={tagStyle(accommodation === a.key)}>{a.label}</button>
              ))}
            </div>
          </div>

          {/* 确认按钮 */}
          <button onClick={launch} style={{
            width: "100%", padding: "12px 0", borderRadius: 10,
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            color: "white", fontWeight: 700, fontSize: 15,
            border: "none", cursor: "pointer", marginTop: 4,
            boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
          }}>
            🚀 AI 智能生成 ({items.length}个景点 · {days || "?"}天 · ¥{budget || "?"})
          </button>
        </div>
      ) : (
        <>
          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            {items.map((a) => (
              <div key={a.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 10px", borderRadius: 8, fontSize: 13, marginBottom: 4,
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
                  fontSize: 18, cursor: "pointer", padding: "2px 6px", flexShrink: 0,
                }} title="移除">×</button>
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
