"use client";

import { ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { latLngToVec3 } from "@/lib/geo";

interface Country {
  name: string;
  slug: string;
  lat: number;
  lng: number;
}

const CONTINENT_COUNTRIES: Record<string, Country[]> = {
  "亚洲": [
    { name: "中国", slug: "cn", lat: 35.86, lng: 104.19 },
    { name: "日本", slug: "jp", lat: 36.20, lng: 138.25 },
  ],
};

interface Props {
  continent: string;
  radius: number;
  onSelectCountry: (slug: string) => void;
  globeRotation: number;
}

export default function CountryPicker({ continent, radius, onSelectCountry, globeRotation }: Props) {
  const countries = CONTINENT_COUNTRIES[continent] || [];
  return (
    <group rotation={[0, globeRotation, 0]}>
      {countries.map((c) => {
        const pos = latLngToVec3(c.lat, c.lng, radius * 1.05);
        const labelPos = latLngToVec3(c.lat, c.lng, radius * 1.15);
        return (
          <group key={c.slug}>
            <mesh
              position={pos}
              onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                onSelectCountry(c.slug);
              }}
              onPointerOver={() => (document.body.style.cursor = "pointer")}
              onPointerOut={() => (document.body.style.cursor = "default")}
            >
              <sphereGeometry args={[0.015, 8, 8]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <Html position={labelPos} center style={{ pointerEvents: "none" }}>
              <span style={{
                color: "white",
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: "nowrap",
                textShadow: "0 0 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)",
              }}>
                {c.name}
              </span>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
