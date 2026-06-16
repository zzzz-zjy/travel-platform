"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Red marker icon for revolutionary sites
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const PROVINCES = [
  { name: "北京", lat: 39.9, lng: 116.4 },
  { name: "上海", lat: 31.2, lng: 121.5 },
  { name: "江西", lat: 27.6, lng: 115.7 },
  { name: "陕西", lat: 36.1, lng: 109.4 },
  { name: "贵州", lat: 26.9, lng: 106.7 },
  { name: "河北", lat: 38.0, lng: 114.9 },
  { name: "湖南", lat: 27.9, lng: 112.5 },
  { name: "浙江", lat: 30.3, lng: 120.2 },
  { name: "重庆", lat: 29.6, lng: 106.5 },
  { name: "甘肃", lat: 35.7, lng: 105.1 },
  { name: "辽宁", lat: 41.8, lng: 123.4 },
];

function SiteList({ province, onClose }: { province: string; onClose: () => void }) {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch sites on mount
  const [fetched, setFetched] = useState(false);
  if (!fetched) {
    setFetched(true);
    fetch(`/api/sites?province=${encodeURIComponent(province)}`)
      .then(r => r.json())
      .then(data => { setSites(data.sites || []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  if (loading) return <div className="popup-loading">加载中...</div>;
  if (sites.length === 0) return <div className="popup-empty">暂无收录旧址</div>;

  return (
    <div className="site-list-popup">
      {sites.map((site: any) => (
        <button
          key={site.id}
          onClick={() => router.push(`/site/${site.id}`)}
          className="site-item-btn"
        >
          <span className="site-type-badge">[{site.siteType}]</span>
          <span className="site-name">{site.name}</span>
          <span className="site-arrow">→</span>
        </button>
      ))}
    </div>
  );
}

function MapClickHandler({ onProvinceSelect }: { onProvinceSelect: (name: string) => void }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      let closest = PROVINCES[0];
      let minDist = Infinity;
      for (const p of PROVINCES) {
        const dist = Math.sqrt((p.lat - lat) ** 2 + (p.lng - lng) ** 2);
        if (dist < minDist) { minDist = dist; closest = p; }
      }
      if (minDist < 2) {
        onProvinceSelect(closest.name);
      }
    },
  });
  return null;
}

export default function ChinaMapScene() {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  return (
    <div style={{ width: "100%", height: "calc(100vh - 56px - 56px)", position: "relative" }}>
      {/* Top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 1000,
        background: "linear-gradient(135deg, #8B0000 0%, #C41E3A 100%)",
        color: "white", padding: "10px 20px", textAlign: "center",
        fontSize: 14, fontWeight: 500,
      }}>
        {selectedProvince ? (
          <>
            <button onClick={() => setSelectedProvince(null)}
              style={{ color: "#D4A574", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>
              ← 返回地图
            </button>
            <span style={{ color: "#D4A574", fontWeight: "bold", marginLeft: 8 }}>{selectedProvince}</span>
            <span style={{ marginLeft: 8 }}>— 点击标记查看革命旧址</span>
          </>
        ) : (
          <span>🗺️ 点击红色标记探索革命旧址</span>
        )}
      </div>

      {/* Map */}
      <MapContainer
        center={[35, 105]}
        zoom={4}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onProvinceSelect={setSelectedProvince} />
        {PROVINCES.map(p => (
          <Marker key={p.name} position={[p.lat, p.lng]} icon={redIcon}>
            <Popup maxWidth={320} minWidth={260}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: "#8B0000" }}>
                {p.name}
              </div>
              <SiteList province={p.name} onClose={() => setSelectedProvince(null)} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 20, right: 20, zIndex: 1000,
        background: "white", borderRadius: 8, padding: "12px 16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)", fontSize: 12,
      }}>
        <div style={{ fontWeight: 600, marginBottom: 6, color: "#8B0000" }}>已收录省份</div>
        <div style={{ color: "#666" }}>共 {PROVINCES.length} 个省份 · 23 个革命旧址</div>
      </div>

      <style jsx global>{`
        .site-list-popup {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 280px;
          overflow-y: auto;
        }
        .site-item-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff8f0;
          border: 1px solid #f0e0d0;
          border-radius: 8px;
          padding: 10px 12px;
          cursor: pointer;
          text-align: left;
          font-size: 13px;
          width: 100%;
          transition: background 0.15s;
        }
        .site-item-btn:hover {
          background: #fef0e0;
        }
        .site-type-badge {
          color: #C41E3A;
          font-size: 11px;
          white-space: nowrap;
        }
        .site-name {
          flex: 1;
          color: #333;
        }
        .site-arrow {
          color: #C41E3A;
          font-size: 16px;
        }
        .popup-loading, .popup-empty {
          padding: 12px;
          font-size: 14px;
          color: #999;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
