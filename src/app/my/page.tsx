"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MyPage() {
  const [tab, setTab] = useState<"fav" | "journeys">("fav");
  const [sites, setSites] = useState<any[]>([]);
  const [journeys, setJourneys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    if (tab === "fav") {
      fetch("/api/favorites")
        .then(r => { if (r.status === 401) { setSites([]); setLoading(false); return null; } return r.json(); })
        .then(data => { if (data) setSites(data.favorites || []); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      fetch("/api/my/journeys")
        .then(r => { if (r.status === 401) { setJourneys([]); setLoading(false); return null; } return r.json(); })
        .then(data => { if (data) setJourneys(data.journeys || []); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [tab]);

  const tabs = [
    { key: "fav", label: "⭐ 我的收藏", count: sites.length },
    { key: "journeys", label: "📝 我的研学", count: journeys.length },
  ];

  return (
    <div style={{ maxWidth: 768, margin: "0 auto", padding: "16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, fontFamily: "var(--font-heading)", color: "var(--color-primary)" }}>
        我的
      </h1>

      <div style={{ display: "flex", gap: 4, background: "#f3f4f6", borderRadius: 10, padding: 4, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)} style={{
            padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer",
            fontSize: 14, fontWeight: tab === t.key ? 600 : 400,
            background: tab === t.key ? "white" : "transparent",
            boxShadow: tab === t.key ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
          }}>
            {t.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => router.push("/journey/new")} style={{
          background: "var(--color-primary-light)", color: "white",
          padding: "10px 20px", borderRadius: 8, border: "none",
          fontWeight: 600, fontSize: 14, cursor: "pointer",
        }}>
          ✨ 创建研学
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#999", padding: 60 }}>加载中...</p>
      ) : tab === "fav" ? (
        sites.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <p style={{ fontSize: 48, margin: 0 }}>⭐</p>
            <p style={{ color: "#999", marginTop: 12 }}>还没有收藏革命旧址</p>
            <p style={{ color: "#999", fontSize: 13 }}>在地图上探索并收藏感兴趣的旧址</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sites.map((site: any) => (
              <button key={site.id} onClick={() => router.push(`/site/${site.id}`)} style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "white", border: "1px solid #f0e0d0", borderRadius: 12,
                padding: "14px 16px", cursor: "pointer", textAlign: "left",
              }}>
                <span style={{
                  background: site.era?.color || "#C41E3A", color: "white",
                  padding: "4px 10px", borderRadius: 9999, fontSize: 11,
                }}>
                  {site.siteType}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{site.name}</div>
                  <div style={{ fontSize: 13, color: "#999", marginTop: 2 }}>
                    {site.city?.province?.name} · {site.city?.name}
                  </div>
                </div>
                <span style={{ color: "#C41E3A" }}>→</span>
              </button>
            ))}
          </div>
        )
      ) : (
        journeys.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <p style={{ fontSize: 48, margin: 0 }}>📝</p>
            <p style={{ color: "#999", marginTop: 12 }}>还没有创建研学路线</p>
            <button onClick={() => router.push("/journey/new")} style={{
              marginTop: 16, background: "var(--color-primary-light)", color: "white",
              padding: "12px 24px", borderRadius: 12, border: "none",
              fontWeight: 600, cursor: "pointer",
            }}>立即创建</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {journeys.map((j: any) => (
              <button key={j.id} onClick={() => router.push(`/journeys/${j.id}`)} style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "white", border: "1px solid #f0e0d0", borderRadius: 12,
                padding: "14px 16px", cursor: "pointer", textAlign: "left",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{j.title}</div>
                  <div style={{ fontSize: 13, color: "#999", marginTop: 2 }}>
                    {j.totalDays}天 · ¥{j.budgetAmount}
                  </div>
                </div>
                <span style={{ color: "#C41E3A" }}>→</span>
              </button>
            ))}
          </div>
        )
      )}
    </div>
  );
}
