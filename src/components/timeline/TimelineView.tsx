"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Era {
  id: number;
  name: string;
  color: string;
  startYear: number;
  endYear: number;
  description: string;
  sites: { id: number; name: string; siteType: string; city: { name: string } }[];
}

export default function TimelineView() {
  const [eras, setEras] = useState<Era[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/eras").then(r => r.json()).then(d => setEras(d.eras || []));
  }, []);

  return (
    <div style={{ padding: "16px", maxWidth: 768, margin: "0 auto" }}>
      <h1 style={{
        fontSize: 22, fontWeight: 700, marginBottom: 20,
        fontFamily: "var(--font-heading)", color: "var(--color-primary)",
      }}>
        革命历史时间线
      </h1>

      <div style={{ position: "relative", paddingLeft: 32 }}>
        <div style={{
          position: "absolute", left: 15, top: 0, bottom: 0,
          width: 2, background: "linear-gradient(180deg, #8B0000, #C41E3A, #DC143C, #D4A574)",
        }} />

        {eras.map((era) => (
          <div key={era.id} style={{ marginBottom: 32, position: "relative" }}>
            <div style={{
              position: "absolute", left: -25, top: 18,
              width: 18, height: 18, borderRadius: "50%",
              background: era.color, border: "3px solid white",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }} />

            <div style={{
              background: `linear-gradient(135deg, ${era.color} 0%, #1a0a0a 100%)`,
              color: "white", borderRadius: 10, padding: "16px 20px",
              marginBottom: 12,
            }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 18, fontFamily: "var(--font-heading)" }}>
                {era.name}
              </h2>
              <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>
                {era.startYear} — {era.endYear}
              </p>
              <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.6, opacity: 0.9 }}>
                {era.description}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 8 }}>
              {era.sites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => router.push(`/site/${site.id}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "white", border: "1px solid #f0e0d0",
                    borderRadius: 8, padding: "10px 14px", cursor: "pointer",
                    textAlign: "left", fontSize: 14,
                  }}
                >
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: era.color, flexShrink: 0,
                  }} />
                  <span style={{ color: "var(--color-text-light)", fontSize: 11 }}>
                    [{site.siteType}]
                  </span>
                  <span style={{ flex: 1, color: "#333" }}>{site.name}</span>
                  <span style={{ fontSize: 12, color: "var(--color-text-light)" }}>
                    {site.city.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
