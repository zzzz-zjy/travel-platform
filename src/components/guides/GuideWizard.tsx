"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SCENARIOS, getScenario } from "@/lib/scenarios";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const PERSONAS = [
  { key: "serious", label: "🎓 严谨干货", desc: "专业详尽的攻略信息" },
  { key: "humorous", label: "😎 幽默闲聊", desc: "轻松有趣的旅行建议" },
  { key: "minimal", label: "🤫 极简安静", desc: "言简意赅，直奔主题" },
];

export default function GuideWizard({ initialPrompt }: { initialPrompt?: string }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"greeting" | "asking" | "generating" | "done">("greeting");
  const [persona, setPersona] = useState("serious");
  const [mode, setMode] = useState<"balanced" | "compact" | "relaxed">("balanced");
  const [regenerating, setRegenerating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialSent = useRef(false);

  const STORAGE_KEY = "guideWizardState";

  // 恢复之前的对话状态
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

  // 持久化对话状态
  useEffect(() => {
    if (messages.length > 0) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, phase }));
      } catch {}
    }
  }, [messages, phase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialPrompt && !initialSent.current) {
      initialSent.current = true;
      const userMsg: Message = { role: "user", content: initialPrompt };
      setMessages([userMsg]);
      setPhase("asking");
      sendWith(userMsg);
    }
  }, [initialPrompt]);

  const streamChat = async (msgs: Message[], extra?: { persona?: string; mode?: string }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/plan/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: msgs.map((m) => ({ role: m.role, content: m.content })),
          phase,
          persona: extra?.persona || persona,
          mode: extra?.mode || mode,
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
          setMessages((prev) => [...prev, { role: "assistant", content: "攻略已生成！正在保存..." }]);

          const saveRes = await fetch("/api/guides", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: parsed.title,
              destinationCityName: parsed.city || null,
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
                  transportTip: i.transportTip || "",
                })),
              })),
            }),
          });
          const saved = await saveRes.json();
          sessionStorage.removeItem(STORAGE_KEY);
          setTimeout(() => router.push(`/guides/${saved.id}`), 1500);
        } catch {
          setMessages((prev) => [...prev, { role: "assistant", content: "保存出错了，请重试。" }]);
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "出错了，请重试。" }]);
    }
    setLoading(false);
    setRegenerating(false);
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

  const handleScenarioClick = (key: string) => {
    const s = getScenario(key);
    if (!s) return;
    const scenarioMsg: Message = {
      role: "user",
      content: `使用"${s.name}"场景模式。${s.promptAddition}`,
    };
    setInput("");
    sendWith(scenarioMsg);
  };

  const handleModeSwitch = async (newMode: "compact" | "balanced" | "relaxed") => {
    if (regenerating) return;
    setMode(newMode);
    setRegenerating(true);
    const modeLabels = { compact: "紧凑", balanced: "适中", relaxed: "松弛" };
    const modeMsg: Message = {
      role: "user",
      content: `请把行程切换为${modeLabels[newMode]}节奏模式重新生成。${newMode === "compact" ? "每天安排更多景点，时间紧凑一点。" : newMode === "relaxed" ? "减少每天的景点数量，留充足的休息和自由探索时间。" : "保持适中节奏。"}`,
    };
    await sendWith(modeMsg);
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{
        border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden",
        display: "flex", flexDirection: "column", height: 560,
      }}>
        {/* Header */}
        <div style={{ padding: 16, borderBottom: "1px solid #e5e7eb", background: "#f8fafc" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>🤖 AI 旅行规划师</h2>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                告诉我你想去哪里，我会帮你定制完美行程
              </p>
            </div>
            {/* AI 风格选择 */}
            <div style={{ display: "flex", gap: 2 }}>
              {PERSONAS.map((p) => (
                <button key={p.key} onClick={() => setPersona(p.key)}
                  title={p.desc}
                  style={{
                    padding: "4px 8px", borderRadius: 6, fontSize: 11,
                    border: persona === p.key ? "1px solid #2563eb" : "1px solid transparent",
                    background: persona === p.key ? "#eff6ff" : "transparent",
                    color: persona === p.key ? "#2563eb" : "#9ca3af",
                    cursor: "pointer", transition: "all 0.15s",
                  }}>{p.label}</button>
              ))}
            </div>
          </div>

          {/* 场景快捷选择 */}
          {messages.length === 0 && (
            <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
              {SCENARIOS.map((s) => (
                <button key={s.key} onClick={() => handleScenarioClick(s.key)} style={{
                  padding: "5px 10px", borderRadius: 99, fontSize: 12,
                  border: "1px solid #e5e7eb", background: "white",
                  color: "#6b7280", cursor: "pointer",
                  transition: "all 0.15s",
                }} title={s.desc}>
                  {s.icon} {s.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", color: "#94a3b8", marginTop: 60 }}>
              <p style={{ fontSize: 28, margin: 0 }}>🌍</p>
              <p style={{ marginTop: 8, fontSize: 14 }}>
                在下方输入你想去的目的地开始规划，或选择上方场景模式
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
        <div style={{ padding: 12, borderTop: "1px solid #e5e7eb" }}>
          {/* 紧凑/松弛切换（生成完成后显示） */}
          {phase === "done" && (
            <div style={{ display: "flex", gap: 6, marginBottom: 10, justifyContent: "center" }}>
              {(["compact", "balanced", "relaxed"] as const).map((m) => (
                <button key={m} onClick={() => handleModeSwitch(m)}
                  disabled={regenerating}
                  style={{
                    padding: "5px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                    border: mode === m ? "2px solid #2563eb" : "2px solid #e5e7eb",
                    background: mode === m ? "#eff6ff" : "white",
                    color: mode === m ? "#2563eb" : "#6b7280",
                    cursor: regenerating ? "not-allowed" : "pointer",
                    opacity: regenerating ? 0.6 : 1,
                    transition: "all 0.15s",
                  }}>
                  {m === "compact" ? "🏃 紧凑" : m === "relaxed" ? "🚶 松弛" : "🎯 适中"}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={phase === "done" ? "攻略已生成，可切换到其他模式" : loading ? "AI 正在思考..." : "输入你的需求..."}
              disabled={loading || regenerating}
              style={{
                flex: 1, padding: "10px 14px", border: "1px solid #d1d5db",
                borderRadius: 10, fontSize: 14, outline: "none",
              }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
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
    </div>
  );
}
