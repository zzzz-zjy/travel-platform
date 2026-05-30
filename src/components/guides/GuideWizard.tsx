"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function GuideWizard() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"greeting" | "asking" | "generating" | "done">("greeting");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    if (phase === "greeting") {
      // First message: parse destination from input
      setPhase("asking");
    }

    try {
      const res = await fetch("/api/ai/plan/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          phase,
        }),
      });

      if (res.status === 429) {
        setMessages((prev) => [...prev, { role: "assistant", content: "今日免费次数已用完（5次/天），请明天再来 🙏" }]);
        setLoading(false);
        return;
      }

      const reader = res.body!.getReader();
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
              setMessages((prev) => {
                const next = [...prev];
                const lastIdx = next.length - 1;
                if (next[lastIdx]?.role === "assistant") {
                  next[lastIdx] = { ...next[lastIdx], content: full };
                } else {
                  next.push({ role: "assistant", content: full });
                }
                return next;
              });
            }
          }
        }
      }

      // Try to parse final JSON and save
      if (full.includes('"title"') && full.includes('"days"')) {
        setPhase("done");
        try {
          const jsonStr = full.substring(full.indexOf("{"), full.lastIndexOf("}") + 1);
          const parsed = JSON.parse(jsonStr);
          setMessages((prev) => [...prev, { role: "assistant", content: "攻略已生成！正在保存..." }]);

          const saveRes = await fetch("/api/guides", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: parsed.title,
              destinationCityId: 1, // fallback
              totalDays: parsed.days?.length || 3,
              budgetAmount: parsed.totalBudget || 3000,
              transportMode: parsed.transport || "地铁+网约车",
              travelStyle: "综合",
              rawJson: JSON.stringify(parsed),
              days: (parsed.days || []).map((d: any) => ({
                dayNumber: d.day,
                title: d.title || "",
                notes: "",
                items: (d.items || []).map((i: any) => ({
                  timeSlot: i.time || "",
                  customSpot: i.spot || "",
                  durationMin: i.duration || 60,
                  ticketReminder: i.ticket ? `${i.ticket.price}元 — ${i.ticket.purchase}` : "",
                  tips: i.tip || "",
                })),
              })),
            }),
          });
          const saved = await saveRes.json();
          setTimeout(() => router.push(`/guides/${saved.id}`), 1500);
        } catch {
          setMessages((prev) => [...prev, { role: "assistant", content: "保存出错了，请重试。" }]);
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "出错了，请重试。" }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{
        border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden",
        display: "flex", flexDirection: "column", height: 560,
      }}>
        {/* Header */}
        <div style={{ padding: 16, borderBottom: "1px solid #e5e7eb", background: "#f8fafc" }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>🤖 AI 旅行规划师</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
            告诉我你想去哪里，我会帮你定制完美行程
          </p>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", color: "#94a3b8", marginTop: 60 }}>
              <p style={{ fontSize: 28, margin: 0 }}>🌍</p>
              <p style={{ marginTop: 8, fontSize: 14 }}>
                在下方输入你想去的目的地开始规划
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}>
              <div style={{
                maxWidth: "85%", padding: "10px 16px", borderRadius: 14,
                background: m.role === "user" ? "#2563eb" : "#f1f5f9",
                color: m.role === "user" ? "white" : "#1e293b",
                fontSize: 14, lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}>
                {m.content || (loading ? "..." : "")}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: 12, borderTop: "1px solid #e5e7eb", display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={phase === "done" ? "攻略已生成" : "输入你的需求..."}
            disabled={loading || phase === "done"}
            style={{
              flex: 1, padding: "10px 14px", border: "1px solid #d1d5db",
              borderRadius: 10, fontSize: 14, outline: "none",
            }}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim() || phase === "done"}
            style={{
              background: loading ? "#94a3b8" : "#2563eb",
              color: "white", padding: "10px 20px", border: "none",
              borderRadius: 10, fontWeight: 600, fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
