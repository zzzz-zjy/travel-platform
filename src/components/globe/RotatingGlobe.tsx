"use client";

import { useRef, useCallback, MutableRefObject } from "react";
import { useFrame, useLoader, ThreeEvent } from "@react-three/fiber";
import { Mesh, TextureLoader } from "three";

interface Props {
  selectedContinent: string | null;
  onGlobeClick: (lat: number, lng: number) => void;
  rotationRef: MutableRefObject<number>;
}

export default function RotatingGlobe({ selectedContinent, onGlobeClick, rotationRef }: Props) {
  const meshRef = useRef<Mesh>(null);
  const texture = useLoader(TextureLoader, "/earth-texture.jpg");

  useFrame((_, delta) => {
    if (meshRef.current) {
      rotationRef.current = meshRef.current.rotation.y;
      if (!selectedContinent) {
        meshRef.current.rotation.y += delta * 0.1;
      }
    }
  });

  const handleClick = useCallback((event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (!meshRef.current) return;

    const localPoint = meshRef.current.worldToLocal(event.point.clone());
    const x = localPoint.x;
    const y = Math.max(-1, Math.min(1, localPoint.y));
    const z = localPoint.z;

    const phi = Math.acos(y);
    const lat = 90 - phi * (180 / Math.PI);
    const theta = Math.atan2(z, -x);
    let lng = theta * (180 / Math.PI) - 180;
    if (lng < -180) lng += 360;

    onGlobeClick(lat, lng);
  }, [onGlobeClick]);

  return (
    <mesh ref={meshRef} onClick={handleClick}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.65}
        metalness={0.05}
      />
    </mesh>
  );
}
