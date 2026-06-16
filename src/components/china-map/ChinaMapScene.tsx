"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ChinaMapCanvas from "./ChinaMapCanvas";
import ProvincePicker from "./ProvincePicker";

export default function ChinaMapScene() {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const router = useRouter();

  const handleProvinceClick = useCallback((provinceName: string) => {
    setSelectedProvince(provinceName);
  }, []);

  const handleSelectSite = useCallback((siteId: number) => {
    router.push(`/site/${siteId}`);
  }, [router]);

  const handleClosePicker = useCallback(() => {
    setSelectedProvince(null);
  }, []);

  return (
    <div style={{ width: "100%", height: "calc(100vh - 56px - 56px)", position: "relative",
      background: "linear-gradient(180deg, #1a0a0a 0%, #3d1010 50%, #8B0000 100%)" }}>
      {/* Title overlay */}
      <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
        <div style={{
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)",
          color: "white", padding: "12px 28px", borderRadius: 9999,
          fontSize: 15, fontWeight: 500, whiteSpace: "nowrap",
          border: "1px solid rgba(212,165,116,0.3)",
        }}>
          {selectedProvince ? (
            <>
              <button onClick={handleClosePicker}
                style={{ color: "#D4A574", background: "none", border: "none", cursor: "pointer", marginRight: 8 }}>
                ← 返回
              </button>
              <span style={{ color: "#D4A574", fontWeight: "bold" }}>{selectedProvince}</span>
              <span style={{ marginLeft: 8, opacity: 0.8 }}>— 选择革命旧址</span>
            </>
          ) : (
            <span>点击地图探索革命旧址</span>
          )}
        </div>
      </div>

      <Canvas camera={{ position: [0, -0.5, 4], fov: 35 }} style={{ position: "relative", zIndex: 1 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[2, 1, 3]} intensity={0.8} />
        <Suspense fallback={null}>
          <ChinaMapCanvas onProvinceClick={handleProvinceClick} />
          {selectedProvince && (
            <ProvincePicker
              provinceName={selectedProvince}
              onSelectSite={handleSelectSite}
              onClose={handleClosePicker}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
