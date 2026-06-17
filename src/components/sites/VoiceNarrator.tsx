"use client";

import { useState, useEffect, useRef } from "react";

export default function VoiceNarrator({ text, title }: { text: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
    }
  }, []);

  if (!supported) return null;

  const speak = () => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "zh-CN";
    u.rate = 0.9;
    u.pitch = 1.0;
    u.onend = () => { setPlaying(false); setPaused(false); };
    u.onerror = () => { setPlaying(false); setPaused(false); };
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
    setPlaying(true);
    setPaused(false);
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setPaused(true);
  };

  const resume = () => {
    window.speechSynthesis.resume();
    setPaused(false);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setPlaying(false);
    setPaused(false);
  };

  if (!playing) {
    return (
      <button onClick={speak} style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "#8B0000", color: "white", border: "none",
        borderRadius: 8, padding: "8px 16px", fontSize: 14,
        fontWeight: 600, cursor: "pointer",
      }}>
        🔊 语音讲解{title}
      </button>
    );
  }

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      {paused ? (
        <button onClick={resume} style={ctrlStyle}>▶ 继续</button>
      ) : (
        <button onClick={pause} style={ctrlStyle}>⏸ 暂停</button>
      )}
      <button onClick={stop} style={{ ...ctrlStyle, background: "#999" }}>⏹ 停止</button>
      <span style={{ fontSize: 12, color: "#8B0000", fontWeight: 600 }}>🔊 播放中...</span>
    </div>
  );
}

const ctrlStyle: React.CSSProperties = {
  background: "#C41E3A", color: "white", border: "none",
  borderRadius: 6, padding: "6px 12px", fontSize: 13,
  fontWeight: 600, cursor: "pointer",
};
