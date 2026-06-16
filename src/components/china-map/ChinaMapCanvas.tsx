"use client";

import { useRef, useCallback } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { DoubleSide } from "three";

interface Props {
  onProvinceClick: (provinceName: string) => void;
}

const PROVINCES: { name: string; x: number; y: number; size: number }[] = [
  { name: "北京", x: 1.1, y: 0.8, size: 0.12 },
  { name: "上海", x: 1.3, y: -0.5, size: 0.1 },
  { name: "江西", x: 0.9, y: -1.0, size: 0.15 },
  { name: "陕西", x: 0.1, y: 0.2, size: 0.18 },
  { name: "贵州", x: 0.1, y: -1.5, size: 0.15 },
  { name: "河北", x: 1.0, y: 0.7, size: 0.15 },
  { name: "湖南", x: 0.6, y: -1.2, size: 0.15 },
  { name: "浙江", x: 1.2, y: -0.8, size: 0.12 },
  { name: "重庆", x: 0.3, y: -1.4, size: 0.13 },
  { name: "甘肃", x: -0.3, y: 0.4, size: 0.2 },
  { name: "辽宁", x: 1.2, y: 1.2, size: 0.15 },
];

export default function ChinaMapCanvas({ onProvinceClick }: Props) {
  const groupRef = useRef<any>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.03;
    }
  });

  const handleClick = useCallback((event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const point = event.point;
    const x = point.x * 2;
    const y = point.y * 2;

    let closest = PROVINCES[0];
    let minDist = Infinity;
    for (const p of PROVINCES) {
      const dist = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
      if (dist < minDist) { minDist = dist; closest = p; }
    }
    if (minDist < 0.6) {
      onProvinceClick(closest.name);
    }
  }, [onProvinceClick]);

  return (
    <group ref={groupRef}>
      <mesh rotation={[-Math.PI / 6, 0, 0]} position={[0.2, -0.1, 0]} onClick={handleClick}>
        <planeGeometry args={[4, 3.5]} />
        <meshStandardMaterial color="#1a0a0a" roughness={0.9} side={DoubleSide} />
      </mesh>
      {PROVINCES.map((p) => (
        <mesh key={p.name} position={[p.x * 0.5, p.y * 0.45 + 0.1, 0.01]} rotation={[-Math.PI / 6, 0, 0]}>
          <sphereGeometry args={[p.size, 16, 16]} />
          <meshBasicMaterial color="#C41E3A" />
        </mesh>
      ))}
    </group>
  );
}
