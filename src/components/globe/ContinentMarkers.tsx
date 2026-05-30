"use client";

import { ThreeEvent } from "@react-three/fiber";
import { latLngToVec3 } from "@/lib/geo";

interface ContinentBounds {
  name: string;
  latMin: number; latMax: number;
  lngMin: number; lngMax: number;
}

const CONTINENTS: ContinentBounds[] = [
  { name: "亚洲", latMin: 5, latMax: 75, lngMin: 30, lngMax: 180 },
  { name: "欧洲", latMin: 35, latMax: 72, lngMin: -25, lngMax: 50 },
  { name: "非洲", latMin: -35, latMax: 37, lngMin: -20, lngMax: 55 },
  { name: "北美洲", latMin: 25, latMax: 72, lngMin: -170, lngMax: -50 },
  { name: "南美洲", latMin: -55, latMax: 12, lngMin: -80, lngMax: -35 },
  { name: "大洋洲", latMin: -45, latMax: -5, lngMin: 110, lngMax: 180 },
];

interface Props {
  radius: number;
  onSelectContinent: (name: string) => void;
  selectedContinent: string | null;
}

export default function ContinentMarkers({ radius, onSelectContinent, selectedContinent }: Props) {
  return (
    <group>
      {CONTINENTS.map((c) => {
        const center = latLngToVec3(
          (c.latMin + c.latMax) / 2,
          (c.lngMin + c.lngMax) / 2,
          radius * 1.02
        );
        const isSelected = selectedContinent === c.name;
        return (
          <mesh
            key={c.name}
            position={center}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              onSelectContinent(c.name);
            }}
            onPointerOver={() => (document.body.style.cursor = "pointer")}
            onPointerOut={() => (document.body.style.cursor = "default")}
          >
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshBasicMaterial color={isSelected ? "#f59e0b" : "#60a5fa"} />
          </mesh>
        );
      })}
    </group>
  );
}
