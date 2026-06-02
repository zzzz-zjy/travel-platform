"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface GuideSummary {
  id: number;
  title: string;
  totalDays: number;
  budgetAmount: number;
  transportMode: string;
  travelStyle: string;
  destinationCity: { name: string; province: { name: string; country: { name: string } } };
  days: { id: number; items: { id: number }[] }[];
}

const TRAVEL_STYLES = ["全部", "美食", "文化", "户外", "休闲", "摄影"];

function FavBtn({ guideId }: { guideId: number }) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [faved, setFaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !token) return;
    fetch(`/api/favorites?guideId=${guideId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.favorited !== undefined) setFaved(d.favorited); })
      .catch(() => {});
  }, [guideId, user, token]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { router.push("/login"); return; }
    if (loading) return;
    setLoading(true);
    try {
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers,
        body: JSON.stringify({ guideId }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.favorited !== undefined) setFaved(data.favorited);
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <span onClick={toggle} style={{
      fontSize: 20, cursor: "pointer", userSelect: "none",
      position: "absolute", bottom: 12, right: 12,
      opacity: loading ? 0.5 : 1,
    }} title="收藏">
      {faved ? "⭐" : "☆"}
    </span>
  );
}

export default function GuideList({ guides }: { guides: GuideSummary[] }) {
  const [activeStyle, setActiveStyle] = useState("全部");

  const filtered = activeStyle === "全部"
    ? guides
    : guides.filter((g) => g.travelStyle === activeStyle);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {TRAVEL_STYLES.map((s) => (
          <button
            key={s}
            onClick={() => setActiveStyle(s)}
            style={{
              padding: "8px 16px", borderRadius: 9999, fontSize: 14, fontWeight: 500,
              border: "none", cursor: "pointer",
              background: activeStyle === s ? "#2563eb" : "#f3f4f6",
              color: activeStyle === s ? "white" : "#4b5563",
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
        {filtered.map((guide) => (
          <Link key={guide.id} href={`/guides/${guide.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{
              border: "1px solid #e5e7eb", borderRadius: 12, padding: 20,
              transition: "box-shadow 0.2s", cursor: "pointer", position: "relative",
            }}>
              <h3 style={{ fontSize: 18, fontWeight: "bold", margin: 0, paddingRight: 30 }}>{guide.title}</h3>
              <p style={{ color: "#666", fontSize: 14, marginTop: 4 }}>
                {guide.destinationCity.province.country.name} · {guide.destinationCity.name}
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 12, fontSize: 14, color: "#4b5563" }}>
                <span>{guide.totalDays}天</span>
                <span>¥{guide.budgetAmount}</span>
                <span>{guide.transportMode}</span>
              </div>
              <div style={{ marginTop: 12 }}>
                <span style={{
                  fontSize: 12, background: "#ede9fe", color: "#6d28d9",
                  padding: "4px 10px", borderRadius: 9999
                }}>
                  {guide.travelStyle}
                </span>
              </div>
              <FavBtn guideId={guide.id} />
            </div>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <p style={{ textAlign: "center", color: "#9ca3af", padding: 60 }}>暂无攻略，去创建一个吧!</p>
      )}
    </div>
  );
}
