"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const INTERESTS = [
  { key: "food", label: "🍜 美食", emoji: "🍜" },
  { key: "culture", label: "🏛️ 人文历史", emoji: "🏛️" },
  { key: "nature", label: "🏔️ 自然风光", emoji: "🏔️" },
  { key: "hidden_gem", label: "💎 小众冷门", emoji: "💎" },
  { key: "adventure", label: "🧗 户外探险", emoji: "🧗" },
  { key: "photography", label: "📷 摄影打卡", emoji: "📷" },
];

interface Recommendation {
  city: string;
  reason: string;
  bestSeason: string;
  forWho: string;
  hiddenGem: string;
  matchScore: number;
}

export default function InspirePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [region, setRegion] = useState<"domestic" | "international">("domestic");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Recommendation[]>([]);

  const toggle = (k: string) => {
    setSelected((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );
  };

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/inspire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: selected, region }),
      });
      const data = await res.json();
      setResults(data.recommendations || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  const explore = (city: string) => {
    router.push(`/guide/new?q=${encodeURIComponent(`我想去${city}旅行`)}`);
  };

  const scoreColor = (score: number) =>
    score >= 90 ? "#059669" : score >= 80 ? "#d97706" : "#6b7280";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <Link href="/" style={{ color: "#2563eb", textDecoration: "none", fontSize: 14 }}>
        ← 返回首页
      </Link>
      <h1 style={{ fontSize: 32, fontWeight: "bold", margin: "16px 0 8px" }}>
        💡 目的地灵感
      </h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        不知道去哪玩？选择你的偏好，AI 为你发现冷门宝藏目的地
      </p>

      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        <button onClick={() => setRegion("domestic")} style={{
          padding: "8px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600,
          border: region === "domestic" ? "2px solid #2563eb" : "1px solid #e5e7eb",
          background: region === "domestic" ? "#eff6ff" : "white",
          color: region === "domestic" ? "#2563eb" : "#6b7280",
          cursor: "pointer", transition: "all 0.15s",
        }}>🇨🇳 国内</button>
        <button onClick={() => setRegion("international")} style={{
          padding: "8px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600,
          border: region === "international" ? "2px solid #2563eb" : "1px solid #e5e7eb",
          background: region === "international" ? "#eff6ff" : "white",
          color: region === "international" ? "#2563eb" : "#6b7280",
          cursor: "pointer", transition: "all 0.15s",
        }}>🌏 国外</button>
      </div>

      {/* 偏好选择 */}
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#374151", display: "block", marginBottom: 10 }}>
          选择你的旅行偏好（可多选）
        </span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {INTERESTS.map((i) => (
            <button key={i.key} onClick={() => toggle(i.key)} style={{
              padding: "8px 16px", borderRadius: 99, fontSize: 13, fontWeight: 500,
              border: selected.includes(i.key) ? "2px solid #2563eb" : "1px solid #e5e7eb",
              background: selected.includes(i.key) ? "#eff6ff" : "white",
              color: selected.includes(i.key) ? "#2563eb" : "#6b7280",
              cursor: "pointer", transition: "all 0.15s",
            }}>
              {i.label}
            </button>
          ))}
        </div>
        <button onClick={getRecommendations} disabled={loading} style={{
          marginTop: 16, padding: "12px 32px", borderRadius: 12,
          background: loading ? "#d1d5db" : "linear-gradient(135deg, #2563eb, #7c3aed)",
          color: "white", fontWeight: 700, fontSize: 15, border: "none",
          cursor: loading ? "default" : "pointer",
          boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
        }}>
          {loading ? "⏳ AI 正在寻找灵感..." : "✨ 发现灵感"}
        </button>
      </div>

      {/* 推荐结果 */}
      {results.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {results.map((r, i) => (
            <div key={i} style={{
              border: "1px solid #e5e7eb", borderRadius: 14, padding: 20,
              background: "white", transition: "box-shadow 0.2s",
              cursor: "pointer",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{r.city}</h3>
                <span style={{
                  fontSize: 14, fontWeight: 700, color: scoreColor(r.matchScore),
                }}>
                  {r.matchScore}%
                </span>
              </div>
              <p style={{ fontSize: 13, color: "#6b7280", marginTop: 8, lineHeight: 1.6 }}>
                {r.reason}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 12, fontSize: 12, color: "#9ca3af" }}>
                <span>🌸 最佳季节：{r.bestSeason}</span>
                <span>👥 适合人群：{r.forWho}</span>
                <span>💎 隐藏宝地：{r.hiddenGem}</span>
              </div>
              <button onClick={() => explore(r.city)} style={{
                marginTop: 14, width: "100%", padding: "10px 0", borderRadius: 10,
                background: "#2563eb", color: "white", fontWeight: 600,
                fontSize: 13, border: "none", cursor: "pointer",
              }}>
                去{r.city}旅行 →
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
          <p style={{ fontSize: 48, margin: 0 }}>🗺️</p>
          <p style={{ marginTop: 12, fontSize: 16 }}>
            选择偏好后，AI 会为你推荐冷门目的地
          </p>
        </div>
      )}
    </div>
  );
}
