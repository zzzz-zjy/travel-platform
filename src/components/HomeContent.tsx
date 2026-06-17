"use client";

import { useState } from "react";
import CoverOverlay from "@/components/CoverOverlay";
import ChinaMapWrapper from "@/components/china-map/ChinaMapWrapper";
export default function HomeContent() {
  const [entered, setEntered] = useState(false);

  if (!entered) {
    return <CoverOverlay onEnter={() => setEntered(true)} />;
  }

  return (
    <div style={{
      position: "fixed", top: 42, bottom: 56, left: 0, right: 0,
      overflow: "hidden",
    }}>
      <ChinaMapWrapper />
    </div>
  );
}
