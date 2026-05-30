"use client";

import dynamic from "next/dynamic";

const CountryMap = dynamic(() => import("@/components/map/CountryMap"), {
  ssr: false,
  loading: () => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "calc(100vh - 64px)", color: "#9ca3af"
    }}>
      加载地图中...
    </div>
  ),
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

export default function CountryMapLoader({
  country,
  initialData,
}: {
  country: string;
  initialData: Attraction[];
}) {
  return <CountryMap country={country} initialData={initialData} />;
}
