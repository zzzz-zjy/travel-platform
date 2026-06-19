"use client";

import { usePlan } from "./PlanContext";

const SCENE_MODES = [
  { key: "deep", label: "🎓 深度研学", desc: "每处旧址详细讲解，3天深度学习" },
  { key: "route", label: "🗺️ 主题路线", desc: "按时间线串联历史脉络" },
  { key: "quick", label: "⚡ 精华速览", desc: "1-2天快速打卡核心旧址" },
] as const;

const DAY_OPTIONS = [1, 2, 3, 5, 7];
const BUDGET_OPTIONS = [1000, 2000, 3000, 5000, 8000];

export default function PlanPanel() {
  const {
    allSites, sceneMode, days, budget,
    provinceFilter, eraFilter,
    setSceneMode, setDays, setBudget, setProvinceFilter, setEraFilter,
  } = usePlan();

  const provinces = [...new Set(allSites.map((s) => s.city.province.name))].sort();
  const eras = [...new Set(allSites.map((s) => s.era.name))].sort();

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 20,
      background: "#FDF8F0", borderRadius: 12, padding: 20,
      border: "1px solid #f0e0d0", height: "100%", overflowY: "auto",
    }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#8B0000", margin: 0 }}>
        ⚙️ 研学偏好
      </h3>

      {/* 场景模式 */}
      <Section title="场景模式">
        {SCENE_MODES.map((m) => (
          <button key={m.key} onClick={() => setSceneMode(sceneMode === m.key ? null : m.key)} style={chipStyle(sceneMode === m.key)}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{m.label}</div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{m.desc}</div>
          </button>
        ))}
      </Section>

      {/* 计划天数 */}
      <Section title="计划天数">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <input type="number" value={days} min={1} max={14}
            onChange={(e) => setDays(parseInt(e.target.value) || 3)}
            style={inputStyle}
          />
          <span style={{ fontSize: 13, color: "#888" }}>天</span>
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {DAY_OPTIONS.map((d) => (
            <button key={d} onClick={() => setDays(d)} style={tagStyle(days === d)}>
              {d}天
            </button>
          ))}
        </div>
      </Section>

      {/* 人均预算 */}
      <Section title="人均预算">
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: "#888" }}>¥</span>
          <input type="number" value={budget} min={500} step={500}
            onChange={(e) => setBudget(parseInt(e.target.value) || 3000)}
            style={inputStyle}
          />
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {BUDGET_OPTIONS.map((b) => (
            <button key={b} onClick={() => setBudget(b)} style={tagStyle(budget === b)}>
              ¥{b / 1000}k
            </button>
          ))}
        </div>
      </Section>

      {/* 省份筛选 */}
      <Section title="省份">
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          <button onClick={() => setProvinceFilter(null)} style={tagStyle(!provinceFilter)}>全部</button>
          {provinces.map((p) => (
            <button key={p} onClick={() => setProvinceFilter(provinceFilter === p ? null : p)} style={tagStyle(provinceFilter === p)}>
              {p}
            </button>
          ))}
        </div>
      </Section>

      {/* 时期筛选 */}
      <Section title="历史时期">
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          <button onClick={() => setEraFilter(null)} style={tagStyle(!eraFilter)}>全部</button>
          {eras.map((e) => (
            <button key={e} onClick={() => setEraFilter(eraFilter === e ? null : e)} style={tagStyle(eraFilter === e)}>
              {e}
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#8B0000", marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function chipStyle(active: boolean): React.CSSProperties {
  return {
    display: "block", width: "100%", textAlign: "left" as const,
    padding: "10px 12px", marginBottom: 6, borderRadius: 8,
    border: active ? "2px solid #C41E3A" : "1px solid #e0d0c0",
    background: active ? "#FFF5F5" : "white",
    color: active ? "#8B0000" : "#666",
    cursor: "pointer", fontSize: 12,
    transition: "all 0.15s",
  };
}

function tagStyle(active: boolean): React.CSSProperties {
  return {
    padding: "4px 12px", borderRadius: 9999, fontSize: 12,
    border: active ? "1px solid #C41E3A" : "1px solid #e0d0c0",
    background: active ? "#C41E3A" : "white",
    color: active ? "white" : "#666",
    cursor: "pointer", transition: "all 0.15s",
  };
}

const inputStyle: React.CSSProperties = {
  width: 60, padding: "6px 10px", border: "1px solid #e0d0c0",
  borderRadius: 8, fontSize: 14, outline: "none", textAlign: "center" as const,
};
