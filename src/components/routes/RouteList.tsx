"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface RouteData {
  id: number;
  name: string;
  description: string;
  totalDays: number;
  era: { name: string; color: string };
  stops: {
    day: number;
    order: number;
    site: { id: number; name: string; siteType: string; city: { name: string } };
  }[];
}

export default function RouteList() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/routes").then(r => r.json()).then(d => setRoutes(d.routes || []));
  }, []);

  if (routes.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "var(--color-text-light)" }}>
        <h1 style={{
          fontSize: 22, fontWeight: 700, marginBottom: 16,
          fontFamily: "var(--font-heading)", color: "var(--color-primary)",
        }}>
          红色路线
        </h1>
        <p>路线数据收集中，敬请期待</p>
        <p style={{ fontSize: 14 }}>
          — 将覆盖长征路、延安行、井冈山研学等经典红色路线 —
        </p>
      </div>
    );
  }

  const stopsByDay = (route: RouteData) => {
    const map: Record<number, RouteData["stops"]> = {};
    route.stops.forEach(s => {
      if (!map[s.day]) map[s.day] = [];
      map[s.day].push(s);
    });
    return Object.entries(map).sort(([a], [b]) => parseInt(a) - parseInt(b));
  };

  return (
    <div style={{ padding: "16px", maxWidth: 768, margin: "0 auto" }}>
      <h1 style={{
        fontSize: 22, fontWeight: 700, marginBottom: 20,
        fontFamily: "var(--font-heading)", color: "var(--color-primary)",
      }}>
        红色路线
      </h1>

      {routes.map(route => (
        <div key={route.id} style={{
          background: "white", borderRadius: 12, marginBottom: 16,
          border: "1px solid #f0e0d0", overflow: "hidden",
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${route.era.color} 0%, #1a0a0a 100%)`,
            color: "white", padding: "16px 20px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 17, fontFamily: "var(--font-heading)" }}>
                {route.name}
              </h2>
              <span style={{
                background: "rgba(255,255,255,0.2)", padding: "3px 10px",
                borderRadius: 9999, fontSize: 11,
              }}>
                {route.era.name} · {route.totalDays}天
              </span>
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 13, opacity: 0.9 }}>
              {route.description}
            </p>
          </div>

          <div style={{ padding: 16 }}>
            {stopsByDay(route).map(([day, stops]) => (
              <div key={day} style={{ marginBottom: 12 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: "var(--color-primary)",
                  marginBottom: 6,
                }}>
                  第{day}天 ({stops.length}个旧址)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {stops.map(stop => (
                    <button
                      key={stop.site.id}
                      onClick={() => router.push(`/site/${stop.site.id}`)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: "#FFF8F0", border: "1px solid #f0e0d0",
                        borderRadius: 8, padding: "8px 12px", cursor: "pointer",
                        textAlign: "left", fontSize: 13,
                      }}
                    >
                      <span style={{ color: "var(--color-primary-light)", fontSize: 11 }}>
                        [{stop.site.siteType}]
                      </span>
                      <span style={{ flex: 1 }}>{stop.site.name}</span>
                      <span style={{ color: "var(--color-text-light)", fontSize: 12 }}>
                        {stop.site.city.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
