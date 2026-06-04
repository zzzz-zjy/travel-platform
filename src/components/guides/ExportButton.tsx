"use client";

import { useState } from "react";

interface Props {
  title: string;
}

export default function ExportButton({ title }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    setShowMenu(false);
    window.print();
  };

  const handleCopy = async () => {
    setShowMenu(false);
    // 收集页面攻略内容
    const content = document.querySelector("main")?.textContent || "";
    await navigator.clipboard.writeText(content.replace(/\s{2,}/g, "\n").trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    setShowMenu(false);
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(`${title}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setShowMenu(!showMenu)} style={{
        background: copied ? "#d1fae5" : "#f3f4f6",
        color: copied ? "#059669" : "#4b5563",
        padding: "12px 24px", borderRadius: 12, fontWeight: "bold",
        border: "none", cursor: "pointer", fontSize: 14,
        transition: "all 0.2s",
      }}>
        {copied ? "✅ 已复制" : "📤 导出/分享"}
      </button>

      {showMenu && (
        <>
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99,
          }} onClick={() => setShowMenu(false)} />
          <div style={{
            position: "absolute", bottom: "calc(100% + 8px)", right: 0,
            background: "white", borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            padding: 8, minWidth: 180, zIndex: 100,
            display: "flex", flexDirection: "column", gap: 2,
          }}>
            {[
              { label: "🖨️ 打印 PDF", onClick: handlePrint },
              { label: "📋 复制攻略文本", onClick: handleCopy },
              { label: "🔗 分享链接", onClick: handleShare },
            ].map((item) => (
              <button key={item.label} onClick={item.onClick} style={{
                padding: "10px 14px", borderRadius: 8, border: "none",
                background: "transparent", cursor: "pointer",
                textAlign: "left", fontSize: 13, color: "#374151",
                fontWeight: 500, transition: "background 0.15s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
