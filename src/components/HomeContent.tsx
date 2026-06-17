"use client";

import { useState } from "react";
import CoverOverlay from "@/components/CoverOverlay";
import ChinaMapWrapper from "@/components/china-map/ChinaMapWrapper";
import SelectionBar from "@/components/plan/SelectionBar";

export default function HomeContent() {
  const [entered, setEntered] = useState(false);

  if (!entered) {
    return <CoverOverlay onEnter={() => setEntered(true)} />;
  }

  return (
    <>
      <div style={{ height: "calc(100vh - 44px - 56px)", overflow: "hidden" }}>
        <ChinaMapWrapper />
      </div>
      <SelectionBar />
    </>
  );
}
