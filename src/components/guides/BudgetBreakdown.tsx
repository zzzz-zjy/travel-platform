"use client";

import { useMemo, useState } from "react";

interface GuideDay {
  id: number; dayNumber: number; title: string; notes: string | null;
  items: {
    id: number; timeSlot: string; durationMin: number;
    customSpot: string | null; ticketReminder: string | null; tips: string | null;
    attraction: { id: number; name: string; category: string } | null;
  }[];
}

interface Props {
  budgetAmount: number;
  days: GuideDay[];
  totalDays: number;
}

const CAT_COLORS: Record<string, string> = {
  accommodation: "#3b82f6",
  food: "#f59e0b",
  transport: "#10b981",
  tickets: "#8b5cf6",
  other: "#6b7280",
};

export default function BudgetBreakdown({ budgetAmount, days, totalDays }: Props) {
  const [view, setView] = useState<"total" | "perPerson">("total");

  const breakdown = useMemo(() => {
    let tickets = 0;
    days.forEach((d) => {
      d.items.forEach((item) => {
        if (item.ticketReminder) {
          const match = item.ticketReminder.match(/(\d+)元/);
          if (match) tickets += parseInt(match[1]);
        }
      });
    });

    const total = budgetAmount * (view === "perPerson" ? 1 : 2);
    const perDay = Math.round(total / totalDays);
    const accommodation = Math.round(total * 0.35);
    const food = Math.round(total * 0.25);
    const transport = Math.round(total * 0.15);
    const other = Math.round(total * 0.15) - tickets;
    const actualTickets = tickets || Math.round(total * 0.1);

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
  }, [budgetAmount, days, totalDays, view]);

  const maxVal = Math.max(...breakdown.categories.map((c) => c.value), 1);

  return (
    <div style={{
      border: "1px solid #e5e7eb", borderRadius: 14, padding: 24,
      background: "white", marginTop: 32,
    }}>
      {/* 标题行 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>💰 预算明细</h2>
        <div style={{ display: "flex", gap: 2, background: "#f3f4f6", borderRadius: 8, padding: 3 }}>
          {(["total", "perPerson"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: view === v ? 600 : 400,
              background: view === v ? "white" : "transparent",
              boxShadow: view === v ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
              color: view === v ? "#1f2937" : "#9ca3af",
            }}>{v === "total" ? "总计" : "人均"}</button>
          ))}
        </div>
      </div>

      {/* 合计 */}
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: "#6b7280" }}>预估总花费</span>
        <div style={{ fontSize: 36, fontWeight: 800, color: "#111827" }}>
          ¥{breakdown.total.toLocaleString()}
        </div>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>
          约 ¥{breakdown.perDay.toLocaleString()}/天 · {totalDays}天行程
        </span>
      </div>

      {/* 柱状图 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {breakdown.categories.map((cat) => (
          <div key={cat.cat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, minWidth: 64, color: "#374151" }}>
              {cat.icon} {cat.name}
            </span>
            <div style={{ flex: 1, height: 24, background: "#f3f4f6", borderRadius: 6, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 6,
                width: `${(cat.value / maxVal) * 100}%`,
                background: CAT_COLORS[cat.cat] || "#6b7280",
                transition: "width 0.5s ease",
                minWidth: cat.value > 0 ? 30 : 0,
              }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 80, textAlign: "right", color: "#374151" }}>
              ¥{cat.value.toLocaleString()}
            </span>
            <span style={{ fontSize: 11, color: "#9ca3af", minWidth: 40, textAlign: "right" }}>
              {((cat.value / breakdown.total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 16, fontSize: 12, color: "#9ca3af", textAlign: "center" }}>
        以上为 AI 预估，实际花费可能因季节和预订时间有所不同
      </p>
    </div>
  );
}
