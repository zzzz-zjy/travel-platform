"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewJourneyPage() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [days, setDays] = useState(3);
  const [style, setStyle] = useState("研学");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleGenerate = async () => {
    if (!city.trim() || loading) return;
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          attractions: [],
          days,
          people: 1,
          transport: "大巴+步行",
          budget: 2000,
          style,
          scenario: "study",
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value);
          const lines = text.split("\n").filter(l => l.startsWith("data: "));
          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                full += data.text;
                setResult(full);
              }
              if (data.done && data.full) {
                full = data.full;
                setResult(full);
                // Save journey
                try {
                  const jsonStr = full.substring(full.indexOf("{"), full.lastIndexOf("}") + 1);
                  const parsed = JSON.parse(jsonStr);
                  const saveRes = await fetch("/api/journeys", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      title: parsed.title || `${city}红色研学之旅`,
                      totalDays: days,
                      budgetAmount: parsed.totalBudget || 2000,
                      transportMode: "大巴+步行",
                      travelStyle: style,
                      rawJson: full,
                    }),
                  });
                  const saved = await saveRes.json();
                  if (saved.id) {
                    setTimeout(() => router.push(`/journeys/${saved.id}`), 1500);
                  }
                } catch {}
              }
            } catch {}
          }
        }
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, fontFamily: "var(--font-heading)", color: "var(--color-primary)" }}>
        ✨ 创建红色研学路线
      </h1>

      <div style={{
        background: "white", borderRadius: 12, padding: 24, border: "1px solid #f0e0d0",
        marginBottom: 20,
      }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6, color: "#333" }}>
            目的地城市
          </label>
          <input
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="例如：延安、井冈山、遵义..."
            style={{
              width: "100%", padding: "12px 16px", borderRadius: 8,
              border: "1px solid #e0d0c0", fontSize: 15, outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6, color: "#333" }}>
            研学天数: {days}天
          </label>
          <input
            type="range" min={1} max={7} value={days}
            onChange={e => setDays(parseInt(e.target.value))}
            style={{ width: "100%", accentColor: "var(--color-primary-light)" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#999" }}>
            <span>1天</span><span>7天</span>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6, color: "#333" }}>
            研学风格
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {["研学", "深度历史", "轻松游览"].map(s => (
              <button key={s} onClick={() => setStyle(s)} style={{
                padding: "8px 16px", borderRadius: 9999, fontSize: 13,
                border: style === s ? "2px solid var(--color-primary-light)" : "1px solid #e0d0c0",
                background: style === s ? "#fff0f0" : "white",
                color: style === s ? "var(--color-primary-light)" : "#666",
                cursor: "pointer", fontWeight: style === s ? 600 : 400,
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !city.trim()}
          style={{
            width: "100%", padding: "14px", borderRadius: 10,
            background: loading || !city.trim() ? "#ccc" : "linear-gradient(135deg, #8B0000, #C41E3A)",
            color: "white", border: "none", fontSize: 16, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "AI 正在生成研学路线..." : "🤖 AI 生成研学路线"}
        </button>
      </div>

      {result && (
        <div style={{
          background: "white", borderRadius: 12, padding: 20,
          border: "1px solid #f0e0d0", whiteSpace: "pre-wrap",
          lineHeight: 1.7, fontSize: 14, color: "#333",
        }}>
          {result}
        </div>
      )}
    </div>
  );
}
