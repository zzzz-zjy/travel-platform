"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function TraveloguePage() {
  const params = useParams();
  const id = params.id as string;
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generate();
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/guides/${id}`);
      const guide = await res.json();

      const res2 = await fetch("/api/ai/travelogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guideTitle: guide.title,
          city: guide.destinationCity?.name || "",
          days: guide.days?.map((d: any) => ({
            day: d.dayNumber,
            title: d.title,
            items: d.items?.map((i: any) => ({
              spot: i.attraction?.name || i.customSpot,
              time: i.timeSlot,
              tip: i.tips,
            })),
          })) || [],
        }),
      });

      const reader = res2.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            if (data.done) {
              full = data.full;
            } else if (data.text) {
              full += data.text;
              setContent(full);
            }
          }
        }
      }
    } catch (e) {
      setContent("生成失败，请重试。");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 16px" }}>
      <Link href={`/guides/${id}`} style={{ color: "#2563eb", textDecoration: "none", fontSize: 14 }}>
        ← 返回攻略详情
      </Link>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: "bold", margin: 0 }}>📖 游记</h1>
        <button onClick={generate} disabled={loading} style={{
          padding: "8px 16px", borderRadius: 8, border: "none",
          background: loading ? "#d1d5db" : "#2563eb",
          color: "white", fontWeight: 600, cursor: loading ? "default" : "pointer",
          fontSize: 13,
        }}>
          {loading ? "⏳ 生成中..." : "🔄 重新生成"}
        </button>
      </div>

      {loading && !content && (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
          <p style={{ fontSize: 32, margin: 0 }}>✍️</p>
          <p style={{ marginTop: 12 }}>AI 正在为你生成游记...</p>
        </div>
      )}

      {content && (
        <div style={{
          marginTop: 24, padding: 24, border: "1px solid #e5e7eb",
          borderRadius: 12, background: "white",
          fontSize: 15, lineHeight: 1.8, color: "#374151",
          whiteSpace: "pre-wrap",
        }}>
          {content}
        </div>
      )}
    </div>
  );
}
