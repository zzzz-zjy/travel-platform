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
    // Multiple delayed invalidations: cover overlay fades at 800ms
    const t1 = setTimeout(() => map.invalidateSize(), 200);
    const t2 = setTimeout(() => map.invalidateSize(), 600);
    const t3 = setTimeout(() => map.invalidateSize(), 1200);
    // ResizeObserver for continuous monitoring
    const container = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(container);
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      ro.disconnect();
    };
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
        attribution='&copy; 高德地图'
        url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
        subdomains="1234"
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
