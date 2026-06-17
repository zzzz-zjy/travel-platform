"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { usePlan, SiteBrief } from "@/components/plan/PlanContext";

function createStarIcon(size: number = 26) {
  return L.divIcon({
    className: "china-map-star",
    html: `<div style="
      width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;
      font-size:${size - 4}px;filter:drop-shadow(0 2px 6px rgba(180,30,30,0.5));
      cursor:pointer;transition:transform 0.15s;
    ">⭐</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export default function ChinaMapScene() {
  const router = useRouter();
  const { allSites, selectedIds, toggleSite, selectedSites, days, budget, sceneMode } = usePlan();

  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const handleGenerate = () => {
    const ids = selectedSites.map((s) => s.id).join(",");
    const params = new URLSearchParams();
    params.set("sites", ids);
    params.set("days", String(days));
    params.set("budget", String(budget));
    if (sceneMode) params.set("mode", sceneMode);
    router.push(`/journey/new?${params.toString()}`);
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Top hint bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 1000,
        background: "linear-gradient(90deg, rgba(139,0,0,0.9), rgba(196,30,58,0.9))",
        color: "white", padding: "8px 20px", textAlign: "center",
        fontSize: 13, fontWeight: 500,
      }}>
        ⭐ 点击红色星标探索革命旧址 · 已选中 <span style={{ color: "#FFD700", fontWeight: 700 }}>{selectedSites.length}</span> 个
      </div>

      <MapContainer
        center={[35, 105]}
        zoom={4}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; 高德地图'
          url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
          subdomains="1234"
        />
        {allSites.map((site) => (
          <Marker
            key={site.id}
            position={[site.lat, site.lng]}
            icon={createStarIcon(selectedIds.has(site.id) ? 34 : 26)}
          >
            <Popup maxWidth={300} minWidth={240}>
              <SitePopupContent
                site={site}
                isSelected={selectedIds.has(site.id)}
                onToggle={() => toggleSite(site)}
                onDetail={() => router.push(`/site/${site.id}`)}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 12, right: 12, zIndex: 1000,
        background: "rgba(255,255,255,0.95)", borderRadius: 8,
        padding: "10px 14px", boxShadow: "0 2px 12px rgba(0,0,0,0.12)", fontSize: 12,
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4, color: "#8B0000" }}>已收录</div>
        <div style={{ color: "#666" }}>{allSites.length} 个革命旧址 · 11 个省份</div>
      </div>

      {/* Selected sites floating panel - appears on right when sites selected */}
      {selectedSites.length > 0 && (
        <div style={{
          position: "absolute", top: 44, right: 8, zIndex: 1000,
          background: "white", borderRadius: 12, width: 260,
          boxShadow: "0 4px 24px rgba(0,0,0,0.15)", padding: 16,
          maxHeight: "calc(100% - 120px)", overflowY: "auto",
        }}>
          <h4 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#8B0000" }}>
            📍 已选旧址 ({selectedSites.length})
          </h4>
          {selectedSites.map((s) => (
            <div key={s.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "6px 0", borderBottom: "1px solid #f5f5f5", fontSize: 13,
            }}>
              <span style={{ flex: 1 }}>{s.name}</span>
              <button onClick={() => toggleSite(s)} style={{
                background: "none", border: "none", color: "#999",
                cursor: "pointer", fontSize: 16, padding: "0 4px",
              }}>×</button>
            </div>
          ))}
          <button onClick={handleGenerate} style={{
            width: "100%", marginTop: 12, padding: "10px 0", borderRadius: 8,
            border: "none", background: "linear-gradient(135deg, #C41E3A, #8B0000)",
            color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>
            ✨ 生成研学路线
          </button>
        </div>
      )}

      <style jsx global>{`
        .china-map-star {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}

function SitePopupContent({
  site, isSelected, onToggle, onDetail,
}: {
  site: SiteBrief; isSelected: boolean; onToggle: () => void; onDetail: () => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
        <span style={{
          background: "#FDF1F0", color: "#C41E3A",
          padding: "1px 8px", borderRadius: 99, fontSize: 11,
        }}>
          {site.siteType}
        </span>
        <span style={{
          background: site.era.color + "20", color: site.era.color,
          padding: "1px 8px", borderRadius: 99, fontSize: 11,
        }}>
          {site.era.name}
        </span>
      </div>
      <h4 style={{ margin: "0 0 2px", fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>
        {site.name}
      </h4>
      <p style={{ margin: "0 0 8px", fontSize: 12, color: "#999" }}>
        {site.city.province.name} · {site.city.name} · ⭐ {site.rating}
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onToggle} style={{
          flex: 1, padding: "7px 0", borderRadius: 6, border: "none",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
          background: isSelected ? "#f0f0f0" : "#C41E3A",
          color: isSelected ? "#888" : "white",
        }}>
          {isSelected ? "✓ 已加入" : "+ 加入行程"}
        </button>
        <button onClick={onDetail} style={{
          padding: "7px 12px", borderRadius: 6, fontSize: 13,
          border: "1px solid #e0d0c0", background: "white",
          color: "#8B0000", cursor: "pointer",
        }}>
          详情 →
        </button>
      </div>
    </div>
  );
}
