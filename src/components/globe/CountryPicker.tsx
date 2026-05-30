"use client";

import { ThreeEvent } from "@react-three/fiber";
import { Text } from "@react-three/drei";
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
}

export default function CountryPicker({ continent, radius, onSelectCountry }: Props) {
  const countries = CONTINENT_COUNTRIES[continent] || [];
  return (
    <group>
      {countries.map((c) => {
        const pos = latLngToVec3(c.lat, c.lng, radius * 1.05);
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
              <sphereGeometry args={[0.03, 16, 16]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <Text
              position={[pos[0] * 1.08, pos[1] * 1.08, pos[2] * 1.08]}
              fontSize={0.06}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {c.name}
            </Text>
          </group>
        );
      })}
    </group>
  );
}
