"use client";

import { useState } from "react";

export default function HeroImage({ name, query }: { name: string; query: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div style={{
        width: "100%", height: 360, display: "flex", alignItems: "center",
        justifyContent: "center", background: "linear-gradient(135deg, #667eea, #764ba2)",
        color: "white", fontSize: 64,
      }}>
        🏛️
      </div>
    );
  }

  return (
    <img
      src={`https://source.unsplash.com/featured/?${encodeURIComponent(query)},china,scenic`}
      alt={name}
      style={{ width: "100%", height: 360, objectFit: "cover", display: "block" }}
      onError={() => setFailed(true)}
    />
  );
}
