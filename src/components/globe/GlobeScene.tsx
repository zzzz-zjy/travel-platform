"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import gsap from "gsap";
import RotatingGlobe from "./RotatingGlobe";
import CountryPicker from "./CountryPicker";
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

const CONTINENT_CAMERA: Record<string, { lat: number; lng: number; distance: number }> = {
  "亚洲": { lat: 30, lng: 100, distance: 1.6 },
  "欧洲": { lat: 50, lng: 10, distance: 1.6 },
  "非洲": { lat: 0, lng: 20, distance: 1.6 },
  "北美洲": { lat: 45, lng: -100, distance: 1.6 },
  "南美洲": { lat: -15, lng: -60, distance: 1.6 },
  "大洋洲": { lat: -25, lng: 135, distance: 1.6 },
};

function detectContinent(lat: number, lng: number): string | null {
  for (const c of CONTINENTS) {
    const lngMin = c.lngMin;
    const lngMax = c.lngMax;
    // Handle continents that cross the antimeridian (e.g., Asia: 30 to 180 includes Russia far east)
    const latOk = lat >= c.latMin && lat <= c.latMax;
    const lngOk = lngMin < lngMax
      ? lng >= lngMin && lng <= lngMax
      : lng >= lngMin || lng <= lngMax; // crosses date line
    if (latOk && lngOk) return c.name;
  }
  return null;
}

function CameraController({ target }: { target: THREE.Vector3 | null }) {
  const { camera } = useThree();
  useEffect(() => {
    if (target) {
      gsap.to(camera.position, {
        x: target.x, y: target.y, z: target.z,
        duration: 1.5, ease: "power2.inOut",
      });
    }
  }, [target, camera]);
  return null;
}

type TimeOfDay = "night" | "dawn" | "day" | "dusk";

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 7) return "dawn";
  if (hour >= 7 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

const THEMES: Record<TimeOfDay, {
  bg: string;
  ambientLight: number;
  dirLight: number;
  textColor: string;
  boxBg: string;
}> = {
  night: {
    bg: "#0a0e1a",
    ambientLight: 1.5,
    dirLight: 0.5,
    textColor: "#e2e8f0",
    boxBg: "rgba(255,255,255,0.1)",
  },
  dawn: {
    bg: "linear-gradient(180deg, #1a1a3e 0%, #4a3070 40%, #e8845c 70%, #f5c96a 100%)",
    ambientLight: 1.5,
    dirLight: 0.5,
    textColor: "#1e293b",
    boxBg: "rgba(255,255,255,0.7)",
  },
  day: {
    bg: "linear-gradient(180deg, #3b82f6 0%, #93c5fd 45%, #c9e4ff 100%)",
    ambientLight: 1.5,
    dirLight: 0.5,
    textColor: "#1e293b",
    boxBg: "rgba(255,255,255,0.8)",
  },
  dusk: {
    bg: "linear-gradient(180deg, #1a1040 0%, #6b3a5b 40%, #e07a5f 70%, #f2cc8f 100%)",
    ambientLight: 1.5,
    dirLight: 0.5,
    textColor: "#1e293b",
    boxBg: "rgba(255,255,255,0.6)",
  },
};

// Generate stable pseudo-random star positions
function generateStars(count: number): { x: number; y: number; size: number; delay: number }[] {
  return Array.from({ length: count }, (_, i) => {
    const seed = (i * 16807 + 7) % 2147483647;
    return {
      x: (seed % 10000) / 100,
      y: ((seed * 3) % 10000) / 100,
      size: 1 + ((seed * 7) % 3),
      delay: ((seed * 13) % 5000) / 1000,
    };
  });
}

const STARS = generateStars(80);

const TIME_LABELS: Record<TimeOfDay, string> = {
  night: "🌙", dawn: "🌅", day: "☀️", dusk: "🌇",
};

export default function GlobeScene() {
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [cameraTarget, setCameraTarget] = useState<THREE.Vector3 | null>(null);
  const [lockedRotation, setLockedRotation] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("day");
  const globeRotationRef = useRef(0);

  // Detect local time on client-side only (avoids SSR timezone mismatch)
  // Re-check every 60s so background transitions without page refresh
  useEffect(() => {
    setTimeOfDay(getTimeOfDay());
    const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 60_000);
    return () => clearInterval(interval);
  }, []);
  const router = useRouter();
  const theme = THEMES[timeOfDay];

  const handleGlobeClick = useCallback((lat: number, lng: number) => {
    const continent = detectContinent(lat, lng);
    if (continent && continent !== selectedContinent) {
      setSelectedContinent(continent);
      setLockedRotation(globeRotationRef.current);
      const cam = CONTINENT_CAMERA[continent];
      if (cam) {
        const basePos = new THREE.Vector3(...latLngToVec3(cam.lat, cam.lng, cam.distance));
        basePos.applyAxisAngle(new THREE.Vector3(0, 1, 0), globeRotationRef.current);
        setCameraTarget(basePos);
      }
    }
  }, [selectedContinent]);

  const handleSelectCountry = useCallback((slug: string) => {
    router.push(`/explore/${slug}`);
  }, [router]);

  return (
    <div style={{
      width: "100%", height: "100vh", position: "relative",
      background: theme.bg, overflow: "hidden",
    }}>
      {/* Stars (night only) */}
      {timeOfDay === "night" && STARS.map((star, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${star.x}%`, top: `${star.y}%`,
          width: star.size, height: star.size,
          borderRadius: "50%",
          background: "white",
          opacity: 0.3 + (i % 5) * 0.15,
          animation: `starTwinkle ${1.5 + star.delay}s ease-in-out infinite alternate`,
          pointerEvents: "none", zIndex: 0,
        }} />
      ))}
      {/* Top bar */}
      <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
        <div style={{
          background: theme.boxBg, backdropFilter: "blur(12px)",
          color: theme.textColor, padding: "12px 28px", borderRadius: 9999,
          fontSize: 15, fontWeight: 500, whiteSpace: "nowrap",
          border: `1px solid ${timeOfDay === "day" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.15)"}`,
        }}>
        {selectedContinent ? (
          <>
            <button
              onClick={() => { setSelectedContinent(null); setCameraTarget(null); setLockedRotation(0); }}
              style={{
                color: timeOfDay === "day" ? "#2563eb" : "#93c5fd",
                background: "none", border: "none", cursor: "pointer",
                marginRight: 8, fontSize: 14,
              }}
            >← 返回</button>
            <span style={{ color: timeOfDay === "day" ? "#d97706" : "#fbbf24", fontWeight: "bold" }}>
              {selectedContinent}
            </span>
            <span style={{ marginLeft: 8, opacity: 0.8 }}>— 选择国家</span>
          </>
        ) : (
          <span>{TIME_LABELS[timeOfDay]} 点击地球任意位置选择大洲</span>
        )}
        </div>
      </div>
      <style>{`
        @keyframes starTwinkle {
          0% { opacity: 0.2; }
          100% { opacity: 0.9; }
        }
      `}</style>
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        style={{ width: "100%", height: "100%", position: "relative", zIndex: 1 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 2, 5]} intensity={0.5} />
        <OrbitControls enableZoom={true} minDistance={1.2} maxDistance={4} enablePan={false} />
        <CameraController target={cameraTarget} />
        <Suspense fallback={null}>
          <RotatingGlobe
            selectedContinent={selectedContinent}
            onGlobeClick={handleGlobeClick}
            rotationRef={globeRotationRef}
          />
          {selectedContinent && (
            <CountryPicker
              continent={selectedContinent}
              radius={1}
              onSelectCountry={handleSelectCountry}
              globeRotation={lockedRotation}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
