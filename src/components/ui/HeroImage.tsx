"use client";

import { useState, useMemo } from "react";

const PALETTES: Record<string, [string, string]> = {
  nature: ["#2d6a4f", "#52b788"],
  culture: ["#7b2d8b", "#c77dff"],
  food: ["#e07a5f", "#f4a261"],
  shopping: ["#264653", "#2a9d8f"],
  adventure: ["#d00000", "#ff4d6d"],
};

const EMOJIS: Record<string, string> = {
  nature: "🏔️",
  culture: "🏛️",
  food: "🍜",
  shopping: "🛍️",
  adventure: "🎯",
};

export default function HeroImage({ name, query, category, dbImages }: {
  name: string;
  query: string;
  category?: string;
  dbImages?: string;
}) {
  const [failed, setFailed] = useState(false);

  const cat = category || "nature";
  const [c1, c2] = PALETTES[cat] || PALETTES.nature;
  const emoji = EMOJIS[cat] || "📍";

  const dbImageUrl = useMemo(() => {
    if (!dbImages) return null;
    try {
      const arr = JSON.parse(dbImages);
      if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === "string" && arr[0].startsWith("http")) {
        return arr[0];
      }
    } catch {}
    return null;
  }, [dbImages]);

  const src = dbImageUrl && !failed
    ? dbImageUrl
    : `/api/images?name=${encodeURIComponent(query)}&category=${encodeURIComponent(cat)}&w=800&h=400`;

  if (failed) {
    return (
      <div style={{
        width: "100%", height: 360, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        color: "white", fontSize: 64, gap: 12,
      }}>
        <span>{emoji}</span>
        <span style={{ fontSize: 22, fontWeight: 700, opacity: 0.9 }}>{name}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      style={{ width: "100%", height: 360, objectFit: "cover", display: "block" }}
      onError={() => setFailed(true)}
    />
  );
}
