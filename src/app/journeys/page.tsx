"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function JourneysPage() {
  const [journeys, setJourneys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/journeys")
      .then(r => r.json())
      .then(d => { setJourneys(d.journeys || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 768, margin: "0 auto", padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-heading)", color: "var(--color-primary)", margin: 0 }}>
          研学广场
        </h1>
        <button onClick={() => router.push("/journey/new")} style={{
          background: "linear-gradient(135deg, #8B0000, #C41E3A)", color: "white",
          padding: "10px 20px", borderRadius: 8, border: "none",
          fontWeight: 600, fontSize: 14, cursor: "pointer",
        }}>
          ✨ 创建研学
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#999", padding: 60 }}>加载中...</p>
      ) : journeys.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <p style={{ fontSize: 48, margin: 0 }}>📝</p>
          <p style={{ color: "#999", marginTop: 12 }}>还没有研学路线</p>
          <p style={{ color: "#999", fontSize: 14 }}>成为第一个创建红色研学路线的人！</p>
          <button onClick={() => router.push("/journey/new")} style={{
            marginTop: 16, background: "var(--color-primary-light)", color: "white",
            padding: "12px 24px", borderRadius: 12, border: "none",
            fontWeight: 600, cursor: "pointer",
          }}>
            ✨ 立即创建
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {journeys.map((j: any) => (
            <div key={j.id} onClick={() => router.push(`/my`)} style={{
              background: "white", borderRadius: 12, padding: "16px 20px",
              border: "1px solid #f0e0d0", cursor: "pointer",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{j.title}</h3>
                  <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 13, color: "#666" }}>
                    <span>{j.totalDays}天</span>
                    <span>¥{j.budgetAmount}</span>
                    <span>{j.transportMode}</span>
                    <span>{j.travelStyle}</span>
                  </div>
                </div>
                {j.route?.era && (
                  <span style={{
                    background: j.route.era.color, color: "white",
                    padding: "3px 10px", borderRadius: 9999, fontSize: 11,
                  }}>
                    {j.route.era.name}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
