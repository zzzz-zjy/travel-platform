"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import RotatingGlobe from "./RotatingGlobe";

export default function GlobeScene() {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 3, 5]} intensity={1} />
        <Suspense fallback={null}>
          <RotatingGlobe />
        </Suspense>
      </Canvas>
    </div>
  );
}
