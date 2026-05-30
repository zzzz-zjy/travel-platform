"use client";

import { useState } from "react";
import Link from "next/link";

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
              transition: "box-shadow 0.2s", cursor: "pointer"
            }}>
              <h3 style={{ fontSize: 18, fontWeight: "bold", margin: 0 }}>{guide.title}</h3>
              <p style={{ color: "#666", fontSize: 14, marginTop: 4 }}>
                {guide.destinationCity.province.country.name} · {guide.destinationCity.province.name} · {guide.destinationCity.name}
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
