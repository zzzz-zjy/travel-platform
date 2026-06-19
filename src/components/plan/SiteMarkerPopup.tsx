"use client";

import { Popup } from "react-leaflet";
import { SiteBrief } from "./PlanContext";

interface SiteMarkerPopupProps {
  site: SiteBrief;
  isSelected: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export default function SiteMarkerPopup({
  site,
  isSelected,
  onToggle,
  onClose,
}: SiteMarkerPopupProps) {
  return (
    <Popup
      position={[site.lat, site.lng]}
      eventHandlers={{ remove: onClose }}
    >
      <div style={{ minWidth: 200 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#8B0000" }}>
          {site.name}
        </h3>
        <p style={{ margin: "4px 0", fontSize: 12, color: "#666" }}>
          {site.city.province.name} · {site.city.name}
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
          <span style={{
            fontSize: 11,
            padding: "1px 6px",
            borderRadius: 4,
            background: site.era.color + "20",
            color: site.era.color,
            border: `1px solid ${site.era.color}40`,
          }}>
            {site.era.name}
          </span>
          <span style={{ fontSize: 11, color: "#999" }}>{site.siteType}</span>
        </div>
        <button
          onClick={onToggle}
          style={{
            marginTop: 10,
            width: "100%",
            padding: "6px 0",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            background: isSelected ? "#8B0000" : "#D4A574",
            color: "white",
          }}
        >
          {isSelected ? "移除行程" : "加入行程"}
        </button>
      </div>
    </Popup>
  );
}
