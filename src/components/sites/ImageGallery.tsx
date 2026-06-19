"use client";

import { useState } from "react";

export default function ImageGallery({ images }: { images: string[] }) {
  const [fullIndex, setFullIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  if (fullIndex !== null) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }} onClick={() => setFullIndex(null)}>
        <button onClick={() => setFullIndex(null)} style={{
          position: "absolute", top: 20, right: 20, zIndex: 1,
          background: "rgba(255,255,255,0.2)", color: "white", border: "none",
          borderRadius: "50%", width: 40, height: 40, fontSize: 20, cursor: "pointer",
        }}>✕</button>
        {fullIndex > 0 && (
          <button onClick={(e) => { e.stopPropagation(); setFullIndex(fullIndex - 1); }} style={navBtnStyle("left")}>‹</button>
        )}
        <img src={images[fullIndex]} alt="" style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 8 }} onClick={(e) => e.stopPropagation()} />
        {fullIndex < images.length - 1 && (
          <button onClick={(e) => { e.stopPropagation(); setFullIndex(fullIndex + 1); }} style={navBtnStyle("right")}>›</button>
        )}
        <div style={{ position: "absolute", bottom: 20, color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
          {fullIndex + 1} / {images.length}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8,
      scrollSnapType: "x mandatory",
    }}>
      {images.map((url, i) => (
        <div key={i} onClick={() => setFullIndex(i)} style={{
          minWidth: 200, height: 140, borderRadius: 8, overflow: "hidden",
          cursor: "pointer", scrollSnapAlign: "start",
          flexShrink: 0,
        }}>
          <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ))}
    </div>
  );
}

function navBtnStyle(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute", [side]: 20, top: "50%", transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.15)", color: "white", border: "none",
    borderRadius: "50%", width: 48, height: 48, fontSize: 28, cursor: "pointer",
  };
}
