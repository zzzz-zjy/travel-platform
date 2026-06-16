"use client";

import { useEffect, useState } from "react";
import { Html } from "@react-three/drei";

interface Site {
  id: number;
  name: string;
  siteType: string;
}

interface Props {
  provinceName: string;
  onSelectSite: (siteId: number) => void;
  onClose: () => void;
}

export default function ProvincePicker({ provinceName, onSelectSite, onClose }: Props) {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/sites?province=${encodeURIComponent(provinceName)}`)
      .then(r => r.json())
      .then(data => { setSites(data.sites || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [provinceName]);

  return (
    <Html center position={[0, 0.8, 0]}>
      <div style={{
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)",
        borderRadius: 12, padding: 16, minWidth: 240, maxWidth: 300,
        border: "1px solid rgba(212,165,116,0.3)", color: "white",
      }}>
        <h3 style={{ margin: "0 0 12px", color: "#D4A574", fontSize: 16, fontFamily: "var(--font-heading)" }}>
          {provinceName} · 革命旧址
        </h3>
        {loading ? (
          <p style={{ opacity: 0.6, fontSize: 14 }}>加载中...</p>
        ) : sites.length === 0 ? (
          <p style={{ opacity: 0.6, fontSize: 14 }}>暂无收录旧址</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sites.map((site) => (
              <button
                key={site.id}
                onClick={() => onSelectSite(site.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(196,30,58,0.2)", border: "1px solid rgba(196,30,58,0.4)",
                  borderRadius: 8, padding: "10px 12px", color: "white", cursor: "pointer",
                  textAlign: "left", fontSize: 13,
                }}
              >
                <span style={{ color: "#D4A574", fontSize: 11 }}>
                  [{site.siteType}]
                </span>
                <span>{site.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Html>
  );
}
