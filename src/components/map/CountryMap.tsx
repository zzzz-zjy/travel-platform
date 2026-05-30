"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import Link from "next/link";
import L from "leaflet";
import { wgs84ToGcj02 } from "@/lib/geo";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon for bundlers
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

function MapBounds({ attractions }: { attractions: Attraction[] }) {
  const map = useMap();
  useEffect(() => {
    if (attractions.length > 0) {
      const bounds = L.latLngBounds(
        attractions.map((a) => {
          const [gcjLat, gcjLng] = wgs84ToGcj02(a.lat, a.lng);
          return [gcjLat, gcjLng];
        })
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
  const [attractions] = useState<Attraction[]>(initialData);
  const defaultCenter: [number, number] =
    attractions.length > 0
      ? [attractions[0].lat, attractions[0].lng]
      : [35, 105];

  return (
    <div style={{ width: "100%", height: "calc(100vh - 64px)" }}>
      <MapContainer
        center={defaultCenter}
        zoom={5}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='高德地图'
          url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
          subdomains={["1", "2", "3", "4"]}
        />
        <MapBounds attractions={attractions} />
        {attractions.map((attr) => {
          const [gcjLat, gcjLng] = wgs84ToGcj02(attr.lat, attr.lng);
          return (
          <Marker key={attr.id} position={[gcjLat, gcjLng]} icon={defaultIcon}>
            <Popup>
              <Link
                href={`/attraction/${attr.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div style={{ minWidth: 200 }}>
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
                </div>
              </Link>
            </Popup>
          </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
