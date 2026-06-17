"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { usePlan, SiteBrief } from "./PlanContext";
import SiteMarkerPopup from "./SiteMarkerPopup";

function createStarIcon(size: number = 28) {
  return L.divIcon({
    className: "plan-star-marker",
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

function fixLeafletIcons() {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

function MapController() {
  const map = useMap();
  useEffect(() => {
    map.setView([35.8, 111.5], 5);
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
}

export default function PlanMap() {
  const { allSites, selectedIds, provinceFilter, eraFilter, toggleSite } = usePlan();
  const [popupSite, setPopupSite] = useState<SiteBrief | null>(null);

  useEffect(() => { fixLeafletIcons(); }, []);

  const filtered = useMemo(() =>
    allSites.filter((s) => {
      if (provinceFilter && s.city.province.name !== provinceFilter) return false;
      if (eraFilter && s.era.name !== eraFilter) return false;
      return true;
    }),
    [allSites, provinceFilter, eraFilter]
  );

  return (
    <MapContainer
      center={[35.8, 111.5]}
      zoom={5}
      style={{ width: "100%", height: "100%", borderRadius: 12 }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController />
      {filtered.map((site) => (
        <Marker
          key={site.id}
          position={[site.lat, site.lng]}
          icon={createStarIcon(selectedIds.has(site.id) ? 34 : 26)}
          eventHandlers={{
            click: () => setPopupSite(site),
          }}
        />
      ))}
      {popupSite && (
        <SiteMarkerPopup
          site={popupSite}
          isSelected={selectedIds.has(popupSite.id)}
          onToggle={() => toggleSite(popupSite)}
          onClose={() => setPopupSite(null)}
        />
      )}
    </MapContainer>
  );
}
