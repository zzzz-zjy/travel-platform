"use client";

import { useRouter } from "next/navigation";

interface JourneyData {
  id: number;
  title: string;
  totalDays: number;
  budgetAmount: number;
  transportMode: string;
  travelStyle: string;
  rawJson: string | null;
  createdAt: string;
}

export default function JourneyDetail({ journey }: { journey: JourneyData }) {
  const router = useRouter();

  let parsed: any = null;
  try {
    if (journey.rawJson) {
      const jsonStr = journey.rawJson.includes("{")
        ? journey.rawJson.substring(journey.rawJson.indexOf("{"), journey.rawJson.lastIndexOf("}") + 1)
        : journey.rawJson;
      parsed = JSON.parse(jsonStr);
    }
  } catch {}

  const days = parsed?.days || [];
  const budget = parsed?.totalBudget || journey.budgetAmount;

  return (
    <div style={{ maxWidth: 768, margin: "0 auto", padding: "16px" }}>
      {/* Back */}
      <button onClick={() => router.push("/my")} style={{
        color: "var(--color-primary-light)", background: "none", border: "none",
        cursor: "pointer", fontSize: 14, marginBottom: 16,
      }}>
        ← 返回我的
      </button>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #8B0000 0%, #C41E3A 100%)",
        borderRadius: 12, padding: "24px 20px", marginBottom: 20, color: "white",
      }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 700, fontFamily: "var(--font-heading)" }}>
          {journey.title}
        </h1>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 14, opacity: 0.9 }}>
          <span>{journey.totalDays}天</span>
          <span>¥{budget}</span>
          <span>{journey.transportMode}</span>
          <span>{journey.travelStyle}</span>
        </div>
      </div>

      {/* Day-by-day itinerary */}
      {days.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {days.map((day: any, di: number) => (
            <div key={di} style={{
              background: "white", borderRadius: 12, overflow: "hidden",
              border: "1px solid #f0e0d0",
            }}>
              <div style={{
                background: "linear-gradient(90deg, #8B0000, #C41E3A)",
                color: "white", padding: "12px 20px",
                fontSize: 16, fontWeight: 600,
              }}>
                Day {day.day || di + 1} — {day.title || `第${di + 1}天`}
              </div>
              <div style={{ padding: 16 }}>
                {(day.items || []).map((item: any, ii: number) => (
                  <div key={ii} style={{
                    display: "flex", gap: 12, padding: "12px 0",
                    borderBottom: ii < (day.items || []).length - 1 ? "1px solid #f5f0eb" : "none",
                  }}>
                    <div style={{
                      fontSize: 12, color: "var(--color-text-light)",
                      minWidth: 70, fontFamily: "monospace", paddingTop: 2,
                    }}>
                      {item.time || ""}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                        {item.spot || item.name || `景点${ii + 1}`}
                      </div>
                      {item.duration && (
                        <div style={{ fontSize: 12, color: "#999", marginBottom: 2 }}>
                          ⏱ 约 {item.duration} 分钟
                        </div>
                      )}
                      {item.ticket && (
                        <div style={{ fontSize: 13, color: "#d97706", marginTop: 4 }}>
                          🎫 {typeof item.ticket === "object" ? `${item.ticket.price}元 — ${item.ticket.purchase}` : item.ticket}
                        </div>
                      )}
                      {item.tip && (
                        <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                          💡 {item.tip}
                        </div>
                      )}
                      {item.transportTip && (
                        <div style={{ fontSize: 13, color: "#059669", marginTop: 4 }}>
                          🚇 {item.transportTip}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          background: "white", borderRadius: 12, padding: 32, textAlign: "center",
          border: "1px solid #f0e0d0",
        }}>
          <p style={{ color: "#999", marginBottom: 8 }}>暂无结构化行程数据</p>
          {journey.rawJson && (
            <div style={{
              textAlign: "left", whiteSpace: "pre-wrap", fontSize: 13,
              lineHeight: 1.7, color: "#333", marginTop: 16,
              padding: 16, background: "#fafafa", borderRadius: 8,
            }}>
              {journey.rawJson}
            </div>
          )}
        </div>
      )}

      {/* Budget summary */}
      {parsed?.totalBudget && (
        <div style={{
          marginTop: 20, background: "white", borderRadius: 12, padding: 20,
          border: "1px solid #f0e0d0",
        }}>
          <h3 style={{
            fontSize: 16, fontWeight: 600, marginBottom: 12,
            color: "var(--color-primary)", fontFamily: "var(--font-heading)",
          }}>
            💰 预算概览
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 14 }}>
            <div>总预算</div>
            <div style={{ fontWeight: 600 }}>¥{parsed.totalBudget}</div>
          </div>
        </div>
      )}
    </div>
  );
}
