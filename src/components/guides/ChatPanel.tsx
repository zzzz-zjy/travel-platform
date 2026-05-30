"use client";

import { useState } from "react";

interface Message { role: "user" | "assistant"; content: string; }

export default function ChatPanel({ guideJson }: { guideJson: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          guideContext: guideJson,
        }),
      });

      let full = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            if (data.text) {
              full += data.text;
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: "assistant", content: full };
                return next;
              });
            }
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "太贵了，把总预算降到2000以内",
    "增加一个美食打卡点",
    "我想多玩一天，帮我调整行程",
    "换个便宜一点的住宿方案",
  ];

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, height: 600, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 16, borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
        <h2 style={{ fontWeight: "bold", margin: 0, fontSize: 16 }}>AI 攻略助手</h2>
        <p style={{ fontSize: 13, color: "#666", margin: "4px 0 0" }}>告诉我想怎么调整这个攻略</p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#9ca3af", marginTop: 80 }}>
            <p style={{ fontSize: 16 }}>试试这样说：</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16, alignItems: "center" }}>
              {suggestions.map((s) => (
                <button key={s} onClick={() => setInput(s)}
                  style={{
                    padding: "8px 16px", background: "#f3f4f6", border: "none",
                    borderRadius: 8, cursor: "pointer", fontSize: 13, maxWidth: 350,
                    textAlign: "left", width: "100%",
                  }}>
                  &quot;{s}&quot;
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "80%", padding: "10px 16px", borderRadius: 12,
              background: m.role === "user" ? "#2563eb" : "#f3f4f6",
              color: m.role === "user" ? "white" : "#1f2937",
            }}>
              <p style={{ whiteSpace: "pre-wrap", fontSize: 14, margin: 0 }}>
                {m.content || (loading ? "思考中..." : "")}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: 12, borderTop: "1px solid #e5e7eb", display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="输入修改建议..."
          disabled={loading}
          style={{
            flex: 1, padding: "10px 14px", border: "1px solid #d1d5db",
            borderRadius: 8, fontSize: 14,
          }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            background: loading ? "#d1d5db" : "#2563eb", color: "white",
            padding: "10px 20px", border: "none", borderRadius: 8,
            fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer",
          }}
        >发送</button>
      </div>
    </div>
  );
}
