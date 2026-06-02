"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GuideList from "@/components/guides/GuideList";

export default function MyPage() {
  const [tab, setTab] = useState<"my" | "fav">("my");
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = tab === "my" ? "/api/my/guides" : "/api/favorites";
    const token = localStorage.getItem("auth_token");
    const headers: any = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    fetch(url, { headers })
      .then((r) => { if (r.status === 401) window.location.href = "/login"; return r.json(); })
      .then((data) => setGuides(Array.isArray(data) ? data : (data.guides || [])))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
      <Link href="/explore/cn" style={{ color: "#2563eb", textDecoration: "none", fontSize: 14, marginBottom: 16, display: "inline-block" }}>
        ← 返回地图
      </Link>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 4, background: "#f3f4f6", borderRadius: 10, padding: 4 }}>
          {[
            { key: "my", label: "📝 我的攻略", count: guides.length },
            { key: "fav", label: "⭐ 我的收藏", count: guides.length },
          ].map((t: any) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: tab === t.key ? "bold" : "normal",
              background: tab === t.key ? "white" : "transparent",
              boxShadow: tab === t.key ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}>
              {t.label}
            </button>
          ))}
        </div>
        <Link href="/guide/new" style={{
          background: "#2563eb", color: "white", padding: "12px 24px",
          borderRadius: 12, fontWeight: "bold", textDecoration: "none",
        }}>
          ✨ 创建新攻略
        </Link>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#9ca3af", padding: 60 }}>加载中...</p>
      ) : guides.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80 }}>
          <p style={{ fontSize: 48, margin: 0 }}>{tab === "my" ? "📝" : "⭐"}</p>
          <p style={{ color: "#9ca3af", marginTop: 16, fontSize: 16 }}>
            {tab === "my" ? "还没有生成任何攻略" : "还没有收藏任何攻略"}
          </p>
          {tab === "my" && (
            <Link href="/guide/new" style={{
              display: "inline-block", marginTop: 16, background: "#2563eb",
              color: "white", padding: "12px 24px", borderRadius: 12,
              fontWeight: "bold", textDecoration: "none",
            }}>立即创建</Link>
          )}
          {tab === "fav" && (
            <Link href="/guides" style={{
              display: "inline-block", marginTop: 16, color: "#2563eb",
              fontSize: 16, textDecoration: "none",
            }}>去攻略广场看看</Link>
          )}
        </div>
      ) : (
        <GuideList guides={guides} />
      )}
    </div>
  );
}
