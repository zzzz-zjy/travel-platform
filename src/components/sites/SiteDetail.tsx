"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SiteData {
  id: number;
  name: string;
  siteType: string;
  lat: number; lng: number;
  rating: number;
  ticketInfo: string | null;
  transportTips: string | null;
  description: string | null;
  historicalBg: string;
  openHours: string | null;
  images: string;
  era: { name: string; color: string; description: string };
  city: {
    name: string;
    province: { name: string };
  };
  event: { name: string; date: string; description: string } | null;
  favoriteButton?: boolean;
}

export default function SiteDetail({ site }: { site: SiteData }) {
  const router = useRouter();

  return (
    <div style={{ maxWidth: 768, margin: "0 auto", padding: "16px" }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 13, color: "var(--color-text-light)", marginBottom: 12 }}>
        <span style={{ cursor: "pointer" }} onClick={() => router.push("/")}>首页</span>
        {" > "}
        <span>{site.city.province.name}</span>
        {" > "}
        <span>{site.city.name}</span>
        {" > "}
        <span style={{ color: "var(--color-primary-light)" }}>{site.name}</span>
      </div>

      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${site.era.color} 0%, #1a0a0a 100%)`,
        borderRadius: 12, padding: "24px 20px", marginBottom: 16,
        color: "white",
      }}>
        <div style={{
          display: "inline-block", background: "rgba(255,255,255,0.2)",
          padding: "4px 10px", borderRadius: 9999, fontSize: 12, marginBottom: 8,
        }}>
          {site.siteType}
        </div>
        <h1 style={{
          fontSize: 24, fontWeight: 700, margin: "0 0 4px",
          fontFamily: "var(--font-heading)",
        }}>
          {site.name}
        </h1>
        <p style={{ fontSize: 13, opacity: 0.8 }}>
          {site.city.province.name} · {site.city.name} · 评分 {site.rating}
        </p>
        <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{
            background: "rgba(255,255,255,0.15)", padding: "3px 10px",
            borderRadius: 9999, fontSize: 12,
          }}>
            {site.era.name}
          </span>
          <FavButton siteId={site.id} />
        </div>
      </div>

      {/* Historical Background */}
      <section style={{
        background: "white", borderRadius: 12, padding: 20, marginBottom: 16,
        border: "1px solid #f0e0d0",
      }}>
        <h2 style={{
          fontSize: 18, fontWeight: 600, marginBottom: 12,
          fontFamily: "var(--font-heading)", color: "var(--color-primary)",
          borderLeft: "4px solid var(--color-primary-light)", paddingLeft: 10,
        }}>
          历史背景
        </h2>
        <p style={{ lineHeight: 1.9, fontSize: 15, color: "#333" }}>
          {site.historicalBg}
        </p>
      </section>

      {/* Related Event */}
      {site.event && (
        <section style={{
          background: "white", borderRadius: 12, padding: 20, marginBottom: 16,
          border: "1px solid #f0e0d0",
        }}>
          <h2 style={{
            fontSize: 18, fontWeight: 600, marginBottom: 8,
            fontFamily: "var(--font-heading)", color: "var(--color-primary)",
            borderLeft: "4px solid var(--color-primary-light)", paddingLeft: 10,
          }}>
            {site.event.name}
          </h2>
          <p style={{ fontSize: 13, color: "var(--color-text-light)", marginBottom: 8 }}>
            {site.event.date}
          </p>
          <p style={{ lineHeight: 1.8, fontSize: 14, color: "#333" }}>
            {site.event.description}
          </p>
        </section>
      )}

      {/* Visitor Info */}
      <section style={{
        background: "white", borderRadius: 12, padding: 20, marginBottom: 16,
        border: "1px solid #f0e0d0",
      }}>
        <h2 style={{
          fontSize: 18, fontWeight: 600, marginBottom: 12,
          fontFamily: "var(--font-heading)", color: "var(--color-primary)",
          borderLeft: "4px solid var(--color-primary-light)", paddingLeft: 10,
        }}>
          参观信息
        </h2>
        {site.ticketInfo && <InfoRow label="门票" value={site.ticketInfo} />}
        {site.transportTips && <InfoRow label="交通" value={site.transportTips} />}
        {site.openHours && <InfoRow label="开放时间" value={site.openHours} />}
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", marginBottom: 8, fontSize: 14 }}>
      <span style={{ color: "var(--color-text-light)", minWidth: 70 }}>{label}</span>
      <span style={{ color: "#333" }}>{value}</span>
    </div>
  );
}

function FavButton({ siteId }: { siteId: number }) {
  const [faved, setFaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/favorites?siteId=${siteId}`)
      .then(r => r.json())
      .then(d => { if (d.favorited !== undefined) setFaved(d.favorited); })
      .catch(() => {});
  }, [siteId]);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      });
      if (res.status === 401) { alert("请先登录"); return; }
      const data = await res.json();
      if (data.favorited !== undefined) setFaved(data.favorited);
    } catch {} finally { setLoading(false); }
  };

  return (
    <button onClick={toggle} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: faved ? "#C41E3A" : "rgba(255,255,255,0.2)",
      color: "white", border: "none", borderRadius: 9999,
      padding: "6px 16px", fontSize: 14, cursor: "pointer",
      marginLeft: 8,
    }}>
      {faved ? "★ 已收藏" : "☆ 收藏"}
    </button>
  );
}
