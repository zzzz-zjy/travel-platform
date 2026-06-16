"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface JourneyData {
  id: number;
  title: string;
  totalDays: number;
  budgetAmount: number;
  transportMode: string;
  travelStyle: string;
  rawJson: string | null;
  createdAt: string;
}

const CAT_COLORS: Record<string, string> = {
  accommodation: "#3b82f6", food: "#f59e0b", transport: "#10b981",
  tickets: "#8b5cf6", other: "#6b7280",
};

function BudgetBreakdown({ budgetAmount, days }: { budgetAmount: number; days: any[] }) {
  const [view, setView] = useState<"total" | "perPerson">("total");

  const breakdown = useMemo(() => {
    let tickets = 0;
    days.forEach((d: any) => {
      (d.items || []).forEach((item: any) => {
        if (item.ticket) {
          const t = typeof item.ticket === "object" ? item.ticket.price : item.ticket;
          const match = String(t).match(/(\d+)/);
          if (match) tickets += parseInt(match[1]);
        }
      });
    });

    const total = budgetAmount * (view === "perPerson" ? 1 : 1);
    const perDay = Math.round(total / (days.length || 1));
    const accommodation = Math.round(total * 0.35);
    const food = Math.round(total * 0.25);
    const transport = Math.round(total * 0.15);
    const actualTickets = tickets || Math.round(total * 0.1);
    const other = Math.round(total * 0.15);

    return {
      total: accommodation + food + transport + actualTickets + other,
      categories: [
        { name: "住宿", value: accommodation, cat: "accommodation", icon: "🏨" },
        { name: "餐饮", value: food, cat: "food", icon: "🍽️" },
        { name: "交通", value: transport, cat: "transport", icon: "🚗" },
        { name: "门票", value: actualTickets, cat: "tickets", icon: "🎫" },
        { name: "其他", value: other, cat: "other", icon: "📦" },
      ],
      perDay,
    };
  }, [budgetAmount, days, view]);

  const maxVal = Math.max(...breakdown.categories.map(c => c.value), 1);

  return (
    <div style={{ border: "1px solid #f0e0d0", borderRadius: 14, padding: 24, background: "white", marginTop: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, fontFamily: "var(--font-heading)", color: "var(--color-primary)" }}>💰 预算明细</h2>
        <div style={{ display: "flex", gap: 2, background: "#f3f4f6", borderRadius: 8, padding: 3 }}>
          {(["total", "perPerson"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: view === v ? 600 : 400,
              background: view === v ? "white" : "transparent",
              boxShadow: view === v ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
            }}>{v === "total" ? "总计" : "人均"}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: "#6b7280" }}>预估总花费</span>
        <div style={{ fontSize: 36, fontWeight: 800, color: "#111" }}>¥{breakdown.total.toLocaleString()}</div>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>约 ¥{breakdown.perDay.toLocaleString()}/天 · {days.length || 1}天行程</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {breakdown.categories.map(cat => (
          <div key={cat.cat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, minWidth: 64 }}>{cat.icon} {cat.name}</span>
            <div style={{ flex: 1, height: 24, background: "#f3f4f6", borderRadius: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 6, width: `${(cat.value / maxVal) * 100}%`, background: CAT_COLORS[cat.cat] || "#6b7280", transition: "width 0.5s ease", minWidth: cat.value > 0 ? 30 : 0 }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 80, textAlign: "right" }}>¥{cat.value.toLocaleString()}</span>
            <span style={{ fontSize: 11, color: "#9ca3af", minWidth: 40, textAlign: "right" }}>{total > 0 ? ((cat.value / breakdown.total) * 100).toFixed(0) : 0}%</span>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 16, fontSize: 12, color: "#9ca3af", textAlign: "center" }}>以上为 AI 预估，实际花费可能有所不同</p>
    </div>
  );
}

function QuickActions({ journeyId, onAction }: { journeyId: number; onAction: (prompt: string) => void }) {
  const ACTIONS = [
    { key: "simplify", label: "📋 精简行程", prompt: "请帮我精简这个行程，每天只保留最重要的2-3个核心旧址，去掉次要参观点，让行程更轻松。" },
    { key: "deep_history", label: "📚 深度历史", prompt: "请为每个旧址增加更详细的历史背景讲解，包括相关人物、事件和历史意义。" },
    { key: "add_sites", label: "📍 增加旧址", prompt: "请在这个行程中增加更多有代表性的革命旧址，丰富红色教育内容。" },
    { key: "save_budget", label: "💰 优化预算", prompt: "请帮我优化预算，在保证研学质量的前提下控制花费。" },
  ];

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "16px 0", marginTop: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4, marginRight: 4 }}>⚡ 快捷调整</span>
      {ACTIONS.map(a => (
        <button key={a.key} onClick={() => onAction(a.prompt)} style={{
          padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500,
          border: "1px solid #f0e0d0", background: "white", color: "#4b5563",
          cursor: "pointer", transition: "all 0.15s",
        }}>{a.label}</button>
      ))}
    </div>
  );
}

function ExportButton({ title }: { title: string }) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePrint = () => { setShowMenu(false); window.print(); };
  const handleCopy = async () => {
    setShowMenu(false);
    const content = document.querySelector("main")?.textContent || "";
    await navigator.clipboard.writeText(content.replace(/\s{2,}/g, "\n").trim());
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const handleShare = async () => {
    setShowMenu(false);
    const url = window.location.href;
    if (navigator.share) { await navigator.share({ title, url }); }
    else { await navigator.clipboard.writeText(`${title}\n${url}`); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setShowMenu(!showMenu)} style={{
        background: copied ? "#d1fae5" : "#f3f4f6", color: copied ? "#059669" : "#4b5563",
        padding: "12px 20px", borderRadius: 12, fontWeight: "bold", border: "none", cursor: "pointer", fontSize: 14,
      }}>{copied ? "✅ 已复制" : "📤 导出/分享"}</button>
      {showMenu && (
        <>
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }} onClick={() => setShowMenu(false)} />
          <div style={{ position: "absolute", bottom: "calc(100% + 8px)", right: 0, background: "white", borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.15)", padding: 8, minWidth: 180, zIndex: 100, display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              { label: "🖨️ 打印 PDF", onClick: handlePrint },
              { label: "📋 复制攻略文本", onClick: handleCopy },
              { label: "🔗 分享链接", onClick: handleShare },
            ].map(item => (
              <button key={item.label} onClick={item.onClick} style={{
                padding: "10px 14px", borderRadius: 8, border: "none", background: "transparent",
                cursor: "pointer", textAlign: "left", fontSize: 13, color: "#374151", fontWeight: 500,
              }} onMouseEnter={e => (e.currentTarget.style.background = "#f3f4f6")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function JourneyDetail({ journey }: { journey: JourneyData }) {
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMsgs, setChatMsgs] = useState<{ role: string; content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  let parsed: any = null;
  try {
    if (journey.rawJson) {
      const jsonStr = journey.rawJson.includes("{") ? journey.rawJson.substring(journey.rawJson.indexOf("{"), journey.rawJson.lastIndexOf("}") + 1) : journey.rawJson;
      parsed = JSON.parse(jsonStr);
    }
  } catch {}

  const days = parsed?.days || [];
  const budget = parsed?.totalBudget || journey.budgetAmount;

  const deleteJourney = async () => {
    if (!confirm("确定删除？")) return;
    await fetch(`/api/journeys/${journey.id}`, { method: "DELETE" });
    router.push("/my");
  };

  const handleChatAction = (prompt: string) => {
    setChatInput(prompt);
    setChatOpen(true);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role: "user", content: chatInput };
    setChatMsgs(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...chatMsgs, userMsg], guideContext: journey.rawJson || "" }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";
      setChatMsgs(prev => [...prev, { role: "assistant", content: "" }]);
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = decoder.decode(value).split("\n").filter(l => l.startsWith("data: "));
          for (const line of lines) {
            try { const d = JSON.parse(line.slice(6)); if (d.text) { full += d.text; setChatMsgs(prev => { const next = [...prev]; next[next.length - 1] = { role: "assistant", content: full }; return next; }); } } catch {}
          }
        }
      }
    } catch {} finally { setChatLoading(false); }
  };

  return (
    <div style={{ maxWidth: 768, margin: "0 auto", padding: "16px 16px 80px" }}>
      <button onClick={() => router.push("/my")} style={{ color: "var(--color-primary-light)", background: "none", border: "none", cursor: "pointer", fontSize: 14, marginBottom: 12 }}>← 返回我的</button>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #8B0000 0%, #C41E3A 100%)", borderRadius: 12, padding: "24px 20px", marginBottom: 16, color: "white" }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 700, fontFamily: "var(--font-heading)" }}>{journey.title}</h1>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
          <Badge>{journey.totalDays}天</Badge>
          <Badge>¥{budget}</Badge>
          <Badge>{journey.transportMode}</Badge>
          <Badge>{journey.travelStyle}</Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions journeyId={journey.id} onAction={handleChatAction} />

      {/* Day-by-day */}
      {days.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {days.map((day: any, di: number) => (
            <div key={di} style={{ background: "white", borderRadius: 12, overflow: "hidden", border: "1px solid #f0e0d0" }}>
              <div style={{ background: "linear-gradient(90deg, #8B0000, #C41E3A)", color: "white", padding: "12px 20px", fontSize: 16, fontWeight: 600 }}>
                Day {day.day || di + 1} — {day.title || `第${di + 1}天`}
              </div>
              <div style={{ padding: "16px 20px" }}>
                {(day.items || []).map((item: any, ii: number) => (
                  <div key={ii} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: ii < (day.items || []).length - 1 ? "1px solid #f5f0eb" : "none" }}>
                    <div style={{ fontSize: 12, color: "var(--color-text-light)", minWidth: 70, fontFamily: "monospace", paddingTop: 2 }}>{item.time || ""}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{item.spot || item.name || `参观点${ii + 1}`}</div>
                      {item.duration && <div style={{ fontSize: 12, color: "#999", marginBottom: 2 }}>⏱ 约 {item.duration} 分钟</div>}
                      {item.ticket && <div style={{ fontSize: 13, color: "#d97706", marginTop: 4 }}>🎫 {typeof item.ticket === "object" ? `${item.ticket.price}元 — ${item.ticket.purchase}` : item.ticket}</div>}
                      {item.tip && <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>💡 {item.tip}</div>}
                      {item.transportTip && <div style={{ fontSize: 13, color: "#059669", marginTop: 4 }}>🚇 {item.transportTip}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : journey.rawJson ? (
        <div style={{ background: "white", borderRadius: 12, padding: 20, border: "1px solid #f0e0d0", whiteSpace: "pre-wrap", lineHeight: 1.7, fontSize: 14, color: "#333" }}>{journey.rawJson}</div>
      ) : (
        <div style={{ textAlign: "center", padding: 40, color: "#999" }}>暂无行程数据</div>
      )}

      {/* Budget */}
      {days.length > 0 && <BudgetBreakdown budgetAmount={budget} days={days} />}

      {/* Chat panel */}
      {chatOpen && (
        <div style={{ marginTop: 24, border: "1px solid #f0e0d0", borderRadius: 12, overflow: "hidden", background: "white" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0e0d0", background: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>💬 AI 调整助手</span>
            <button onClick={() => { setChatOpen(false); setChatMsgs([]); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
          <div style={{ height: 300, overflowY: "auto", padding: 12 }}>
            {chatMsgs.length === 0 && <p style={{ textAlign: "center", color: "#999", marginTop: 100, fontSize: 13 }}>输入调整建议，AI 帮你优化行程</p>}
            {chatMsgs.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 8 }}>
                <div style={{ maxWidth: "80%", padding: "8px 14px", borderRadius: 10, background: m.role === "user" ? "var(--color-primary-light)" : "#f3f4f6", color: m.role === "user" ? "white" : "#333", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.content || (chatLoading ? "..." : "")}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: 10, borderTop: "1px solid #f0e0d0", display: "flex", gap: 8 }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} placeholder="输入调整建议..." style={{ flex: 1, padding: "10px 12px", border: "1px solid #e0d0c0", borderRadius: 8, fontSize: 13, outline: "none" }} />
            <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()} style={{ padding: "10px 16px", borderRadius: 8, background: chatLoading ? "#ccc" : "var(--color-primary-light)", color: "white", border: "none", fontWeight: 600, cursor: chatLoading ? "not-allowed" : "pointer", fontSize: 13 }}>发送</button>
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setChatOpen(true)} style={{ background: "#7c3aed", color: "white", padding: "12px 20px", borderRadius: 12, fontWeight: "bold", border: "none", cursor: "pointer", fontSize: 14 }}>💬 AI 微调</button>
        <ExportButton title={journey.title} />
        <button onClick={deleteJourney} style={{ background: "#fee2e2", color: "#dc2626", padding: "12px 20px", borderRadius: 12, fontWeight: "bold", border: "none", cursor: "pointer", fontSize: 14 }}>🗑️ 删除</button>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 9999, fontSize: 13 }}>{children}</span>;
}
