"use client";

import { useRef, useCallback, MutableRefObject } from "react";
import { useFrame, useLoader, ThreeEvent } from "@react-three/fiber";
import { Mesh, TextureLoader, Vector3 } from "three";

interface Props {
  selectedContinent: string | null;
  onGlobeClick: (lat: number, lng: number) => void;
  rotationRef: MutableRefObject<number>;
}

export default function RotatingGlobe({ selectedContinent, onGlobeClick, rotationRef }: Props) {
  const meshRef = useRef<Mesh>(null);
  const texture = useLoader(TextureLoader, "/earth-texture.jpg");
  const bumpMap = useLoader(TextureLoader, "/earth-bump.jpg");
  const pointerDown = useRef<{ x: number; y: number; point: Vector3 } | null>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      rotationRef.current = meshRef.current.rotation.y;
      if (!selectedContinent) {
        meshRef.current.rotation.y += delta * 0.1;
      }
    }
  });

  const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
    pointerDown.current = { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY, point: event.point.clone() };
  }, []);

  const handlePointerUp = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (!meshRef.current || !pointerDown.current) return;

    const dx = event.nativeEvent.clientX - pointerDown.current.x;
    const dy = event.nativeEvent.clientY - pointerDown.current.y;
    const moved = Math.sqrt(dx * dx + dy * dy);

    // Only treat as click if pointer barely moved (dragging = not a click)
    if (moved > 4) {
      pointerDown.current = null;
      return;
    }

    const localPoint = meshRef.current.worldToLocal(pointerDown.current.point);
    pointerDown.current = null;

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
    <mesh ref={meshRef} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
      <sphereGeometry args={[1, 128, 128]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.8}
        metalness={0.0}
      />
    </mesh>
  );
}
