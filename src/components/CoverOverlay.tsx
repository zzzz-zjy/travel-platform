"use client";

import { useState } from "react";

export default function CoverOverlay({ onEnter }: { onEnter: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  const handleEnter = () => {
    setFadeOut(true);
    setTimeout(() => onEnter(), 800);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "radial-gradient(ellipse at 50% 30%, #1a0a0a 0%, #0a0202 50%, #000 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      opacity: fadeOut ? 0 : 1,
      transition: "opacity 0.8s ease-out",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
        opacity: 0.6, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: 32, left: 40, right: 40, height: 1,
        background: "linear-gradient(90deg, transparent, #C9A96E, #C41E3A, #C9A96E, transparent)",
        opacity: 0.3,
      }} />
      <div style={{
        position: "absolute", bottom: 180, left: 40, right: 40, height: 1,
        background: "linear-gradient(90deg, transparent, #C9A96E, #C41E3A, #C9A96E, transparent)",
        opacity: 0.2,
      }} />

      <div style={{ textAlign: "center", animation: "fadeUp 1s ease-out" }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}`}</style>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24,
        }}>
          <div style={{ width: 30, height: 1, background: "#C9A96E", opacity: 0.5 }} />
          <span style={{ fontSize: 14, letterSpacing: 6, color: "#C9A96E", opacity: 0.8 }}>青年红色筑梦之旅</span>
          <div style={{ width: 30, height: 1, background: "#C9A96E", opacity: 0.5 }} />
        </div>

        <h1 style={{
          fontFamily: "'Noto Serif SC', 'Source Han Serif SC', serif",
          fontSize: "clamp(48px, 7vw, 110px)",
          fontWeight: 900, letterSpacing: 12, margin: 0, lineHeight: 1,
          background: "linear-gradient(180deg, #D4A574 0%, #C41E3A 40%, #8B0000 70%, #4a0000 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 2px 30px rgba(180,30,30,0.3))",
        }}>青途智红</h1>

        <p style={{
          fontFamily: "'Noto Serif SC', serif",
          fontSize: "clamp(16px, 2vw, 26px)", letterSpacing: 6,
          color: "#D4A574", opacity: 0.8, marginTop: 16,
        }}>AI赋能青年学子革命旧址沉浸式研学育人平台</p>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 16, margin: "32px 0",
        }}>
          <div style={{ width: 50, height: 1, background: "#C41E3A", opacity: 0.5 }} />
          <div style={{ width: 6, height: 6, background: "#C9A96E", transform: "rotate(45deg)", opacity: 0.6 }} />
          <div style={{ width: 50, height: 1, background: "#C41E3A", opacity: 0.5 }} />
        </div>

        <div style={{
          display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap", marginBottom: 40,
        }}>
          {[
            { icon: "🗺️", label: "交互地图", desc: "11省23个旧址" },
            { icon: "🤖", label: "AI讲解员", desc: "深度学习问答" },
            { icon: "📅", label: "时间线叙事", desc: "四大革命时期" },
            { icon: "📍", label: "路线生成", desc: "AI自动规划" },
          ].map((f, i) => (
            <div key={i} style={{
              textAlign: "center", width: 130,
              animation: `fadeUp 1s ease-out ${0.5 + i * 0.15}s both`,
            }}>
              <div style={{
                width: 56, height: 56, margin: "0 auto 12px",
                border: "1px solid rgba(201,169,110,0.3)", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, background: "rgba(180,30,30,0.1)",
              }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#C9A96E", letterSpacing: 2 }}>{f.label}</div>
              <div style={{ fontSize: 11, color: "rgba(200,180,160,0.5)", marginTop: 4 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        <button onClick={handleEnter} style={{
          padding: "16px 64px", border: "1px solid rgba(201,169,110,0.5)", borderRadius: 4,
          background: "rgba(180,30,30,0.15)", color: "#D4A574",
          fontSize: 18, fontWeight: 600, letterSpacing: 8,
          cursor: "pointer", fontFamily: "'Noto Serif SC', serif",
          transition: "all 0.3s", animation: "fadeUp 1s ease-out 1.4s both",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,30,58,0.3)"; e.currentTarget.style.borderColor = "#D4A574"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(180,30,30,0.15)"; e.currentTarget.style.borderColor = "rgba(201,169,110,0.5)"; }}
        >进入平台</button>

        <div style={{
          display: "flex", gap: 32, justifyContent: "center",
          marginTop: 60, fontSize: 12, color: "rgba(200,180,160,0.4)", letterSpacing: 3,
          animation: "fadeUp 1s ease-out 1.8s both",
        }}>
          <span>教育 · 信息技术</span>
          <span>张鋆宇 · 张春红</span>
          <span>2026</span>
        </div>
      </div>
    </div>
  );
}
