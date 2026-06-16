"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AINarrator() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "你好！我是红色记忆AI讲解员。你可以问我关于任何革命旧址、历史事件或人物的问题，比如：\n\n• 遵义会议为什么是转折点？\n• 帮我规划一个延安3日研学路线\n• 介绍井冈山革命根据地的历史",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          guideContext: "革命旧址教育平台，上下文为用户正在浏览革命旧址相关内容",
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value);
          const lines = text.split("\n").filter(l => l.startsWith("data: "));
          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                fullResponse += data.text;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: fullResponse };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "抱歉，出现了一些问题，请重试。" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px - 56px)" }}>
      <div style={{
        background: "linear-gradient(135deg, #8B0000, #C41E3A)",
        color: "white", padding: "16px 20px", textAlign: "center",
      }}>
        <h1 style={{ margin: 0, fontSize: 18, fontFamily: "var(--font-heading)" }}>
          AI 红色讲解员
        </h1>
      </div>

      <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            marginBottom: 12,
            display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
          }}>
            <div style={{
              maxWidth: "85%", padding: "12px 16px", borderRadius: 12,
              background: msg.role === "user" ? "var(--color-primary-light)" : "white",
              color: msg.role === "user" ? "white" : "#333",
              border: msg.role === "assistant" ? "1px solid #f0e0d0" : "none",
              fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap",
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ textAlign: "center", color: "var(--color-text-light)", fontSize: 13 }}>
            思考中...
          </div>
        )}
      </div>

      <div style={{ padding: 12, borderTop: "1px solid #eee", background: "white" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="输入你的问题..."
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 9999,
              border: "1px solid #e0d0c0", fontSize: 14, outline: "none",
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{
              padding: "10px 20px", borderRadius: 9999,
              background: loading ? "#ccc" : "var(--color-primary-light)",
              color: "white", border: "none", cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14,
            }}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
