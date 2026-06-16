"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STUDY_PRESETS = [
  { key: "deep", label: "📚 深度研学", desc: "每处旧址详细历史背景讲解，适合深度学习", prompt: "请为每处旧址增加详细的历史背景、相关人物和事件讲解，控制在3天内，每天2-3个核心参观点。" },
  { key: "route", label: "🗺️ 主题路线", desc: "按历史事件时间线串联旧址", prompt: "请按革命历史时间线串联旧址，形成完整的历史叙事路线。每天安排2-3个旧址，有逻辑地从早期到后期。" },
  { key: "quick", label: "⚡ 精华速览", desc: "1-2天快速打卡核心旧址", prompt: "请规划一个精华速览路线，1-2天内覆盖最核心的革命旧址，每天3-4个参观点，节奏紧凑高效。" },
];

export default function JourneyWizard({ initialPrompt }: { initialPrompt?: string }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"greeting" | "asking" | "generating" | "done">("greeting");
  const [departureCity, setDepartureCity] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialSent = useRef(false);

  const STORAGE_KEY = "journeyWizardState";

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { messages: savedMsgs, phase: savedPhase } = JSON.parse(saved);
        if (savedMsgs?.length > 0) {
          setMessages(savedMsgs);
          setPhase(savedPhase || "asking");
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, phase })); } catch {}
    }
  }, [messages, phase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialPrompt && !initialSent.current && messages.length === 0) {
      initialSent.current = true;
      const userMsg: Message = { role: "user", content: initialPrompt };
      setMessages([userMsg]);
      setPhase("asking");
      sendWith(userMsg);
    }
  }, [initialPrompt]);

  const streamChat = async (msgs: Message[]) => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/plan/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: msgs.map((m) => ({ role: m.role, content: m.content })),
          phase,
          departureCity,
          departureDate,
        }),
      });

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

      if (full.includes('"title"') && full.includes('"days"')) {
        setPhase("done");
        try {
          const jsonStr = full.substring(full.indexOf("{"), full.lastIndexOf("}") + 1);
          const parsed = JSON.parse(jsonStr);
          setMessages((prev) => [...prev, { role: "assistant", content: "研学路线已生成！正在保存..." }]);

          const saveRes = await fetch("/api/journeys", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: parsed.title,
              totalDays: parsed.days?.length || 3,
              budgetAmount: parsed.totalBudget || 2000,
              transportMode: parsed.transport || "大巴+步行",
              travelStyle: "研学",
              departureCity: departureCity || null,
              departureDate: departureDate || null,
              rawJson: JSON.stringify(parsed),
              days: (parsed.days || []).map((d: any) => ({
                dayNumber: d.day,
                title: d.title || "",
                notes: "",
                stops: (d.items || []).map((i: any) => ({
                  timeSlot: i.time || "",
                  customSpot: i.spot || "",
                  durationMin: i.duration || 60,
                  tips: i.tip || "",
                  transportTip: i.transportTip || "",
                })),
              })),
            }),
          });
          const saved = await saveRes.json();
          sessionStorage.removeItem(STORAGE_KEY);
          setTimeout(() => router.push(`/journeys/${saved.id}`), 1500);
        } catch {
          setMessages((prev) => [...prev, { role: "assistant", content: "保存出错了，请重试。" }]);
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "出错了，请重试。" }]);
    }
    setLoading(false);
  };

  const sendWith = async (userMsg: Message) => {
    const updated = [...messages, userMsg];
    setMessages(updated);
    if (phase === "greeting") setPhase("asking");
    await streamChat(updated);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    setInput("");
    await sendWith(userMsg);
  };

  const handlePreset = (key: string) => {
    const preset = STUDY_PRESETS.find(p => p.key === key);
    if (!preset) return;
    setInput("");
    sendWith({ role: "user", content: preset.prompt });
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{
        border: "1px solid #f0e0d0", borderRadius: 16, overflow: "hidden",
        display: "flex", flexDirection: "column", height: 560,
      }}>
        {/* Header */}
        <div style={{ padding: 16, borderBottom: "1px solid #f0e0d0", background: "#fafafa" }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: "var(--font-heading)", color: "var(--color-primary)" }}>
            🤖 AI 红色研学规划师
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>
            告诉我想去哪里，我会帮你定制红色研学路线
          </p>

          {/* 研学预设 */}
          {messages.length === 0 && (
            <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
              {STUDY_PRESETS.map((s) => (
                <button key={s.key} onClick={() => handlePreset(s.key)} style={{
                  padding: "5px 10px", borderRadius: 99, fontSize: 12,
                  border: "1px solid #f0e0d0", background: "white",
                  color: "var(--color-primary-light)", cursor: "pointer",
                  transition: "all 0.15s",
                }} title={s.desc}>
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Departure */}
        <div style={{ padding: "8px 16px", borderBottom: "1px solid #f0e0d0", background: "#fafafa", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "#666", fontWeight: 500 }}>从</span>
          <input placeholder="出发城市" value={departureCity} onChange={(e) => setDepartureCity(e.target.value)}
            style={{ padding: "6px 10px", border: "1px solid #e0d0c0", borderRadius: 6, fontSize: 13, width: 110, outline: "none" }} />
          <span style={{ fontSize: 13, color: "#666", fontWeight: 500 }}>出发</span>
          <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)}
            style={{ padding: "6px 10px", border: "1px solid #e0d0c0", borderRadius: 6, fontSize: 13, outline: "none" }} />
          <span style={{ fontSize: 11, color: "#999" }}>可选 · 填写后会推荐交通方式</span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", color: "#999", marginTop: 60 }}>
              <p style={{ fontSize: 28, margin: 0 }}>🚩</p>
              <p style={{ marginTop: 8, fontSize: 14 }}>输入你想去的红色研学目的地开始规划</p>
              <p style={{ fontSize: 12, color: "#ccc" }}>或选择上方预设模式</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}>
              <div style={{
                maxWidth: "85%", padding: "10px 16px", borderRadius: 14,
                background: m.role === "user" ? "var(--color-primary-light)" : "#f5f0eb",
                color: m.role === "user" ? "white" : "#333",
                fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap",
              }}>
                {m.content || (loading ? "..." : "")}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: 12, borderTop: "1px solid #f0e0d0" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={loading ? "AI 正在思考..." : "输入你的需求，例如：我想去延安研学长 Days..."}
              disabled={loading}
              style={{
                flex: 1, padding: "10px 14px", border: "1px solid #e0d0c0",
                borderRadius: 10, fontSize: 14, outline: "none",
              }}
            />
            <button onClick={send} disabled={loading || !input.trim()} style={{
              background: loading ? "#ccc" : "var(--color-primary-light)",
              color: "white", padding: "10px 20px", border: "none",
              borderRadius: 10, fontWeight: 600, fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
            }}>
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
