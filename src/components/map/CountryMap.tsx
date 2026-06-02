"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import L from "leaflet";
import { wgs84ToGcj02 } from "@/lib/geo";
import { usePlan } from "@/lib/plan-context";
import "leaflet/dist/leaflet.css";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Attraction {
  id: number;
  name: string;
  lat: number;
  lng: number;
  category: string;
  rating: number;
  ticketInfo: string;
  city: { name: string; province: { name: string } };
}

const CATEGORY_ICONS: Record<string, string> = {
  nature: "🏔️", culture: "🏛️", food: "🍜", shopping: "🛍️", adventure: "🧗",
};

function AttractionPopup({ attr }: { attr: Attraction }) {
  const { items, addAttraction, removeAttraction } = usePlan();
  const added = items.some((x) => x.id === attr.id);

  const toggle = () => {
    if (added) {
      removeAttraction(attr.id);
    } else {
      addAttraction({
        id: attr.id,
        name: attr.name,
        cityName: attr.city.name,
        provinceName: attr.city.province.name,
      });
    }
  };

  return (
    <div style={{ minWidth: 200 }}>
      <Link href={`/attraction/${attr.id}`} style={{ textDecoration: "none", color: "inherit" }}>
        <h3 style={{ fontWeight: "bold", fontSize: 16, margin: 0 }}>
          {(CATEGORY_ICONS[attr.category] || "📍")} {attr.name}
        </h3>
        <p style={{ color: "#666", fontSize: 13, margin: "4px 0" }}>
          {attr.city.province.name} · {attr.city.name}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <span style={{ color: "#f59e0b" }}>★ {attr.rating}</span>
          <span style={{ fontSize: 12, background: "#f3f4f6", padding: "2px 8px", borderRadius: 4 }}>
            {attr.category}
          </span>
        </div>
      </Link>
      <button onClick={toggle} style={{
        marginTop: 8, width: "100%", padding: "6px 0", borderRadius: 8,
        border: added ? "1px solid #ef4444" : "1px solid #2563eb",
        background: added ? "#fef2f2" : "#eff6ff",
        color: added ? "#ef4444" : "#2563eb",
        fontSize: 13, fontWeight: 600, cursor: "pointer",
      }}>
        {added ? "✓ 已加入行程" : "➕ 加入行程"}
      </button>
    </div>
  );
}

function MapBounds({ attractions }: { attractions: Array<{ gcjLat: number; gcjLng: number }> }) {
  const map = useMap();
  useEffect(() => {
    if (attractions.length > 0) {
      const bounds = L.latLngBounds(
        attractions.map((a) => [a.gcjLat, a.gcjLng])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [attractions, map]);
  return null;
}

export default function CountryMap({
  country: _country,
  initialData,
}: {
  country: string;
  initialData: Attraction[];
}) {
  const markers = useMemo(
    () =>
      initialData.map((attr) => {
        const [gcjLat, gcjLng] = wgs84ToGcj02(attr.lat, attr.lng);
        return { ...attr, gcjLat, gcjLng };
      }),
    [initialData]
  );

  const center: [number, number] =
    markers.length > 0
      ? [markers[0].lat, markers[0].lng]
      : [35, 105];

  return (
    <div style={{ width: "100%", height: "calc(100vh - 64px)" }}>
      <MapContainer
        center={center}
        zoom={5}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='高德地图'
          url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
          subdomains={["1", "2", "3", "4"]}
        />
        <MapBounds attractions={markers} />
        {markers.map((attr) => (
          <Marker key={attr.id} position={[attr.gcjLat, attr.gcjLng]} icon={defaultIcon}>
            <Popup>
              <AttractionPopup attr={attr} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
