"use client";

import Link from "next/link";

interface GuideWithDays {
  id: number;
  title: string;
  totalDays: number;
  budgetAmount: number;
  transportMode: string;
  travelStyle: string;
  destinationCity: {
    name: string;
    province: { name: string; country: { name: string; slug: string } };
  };
  days: {
    id: number; dayNumber: number; title: string; notes: string | null;
    items: {
      id: number; timeSlot: string; durationMin: number;
      customSpot: string | null; ticketReminder: string | null; tips: string | null;
      attraction: { id: number; name: string; category: string } | null;
    }[];
  }[];
}

export default function GuideDetail({ guide }: { guide: GuideWithDays }) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <Link href="/guides" style={{ color: "#2563eb", textDecoration: "none", fontSize: 14 }}>
        ← 返回攻略广场
      </Link>

      <div style={{ marginTop: 24 }}>
        <h1 style={{ fontSize: 30, fontWeight: "bold", margin: 0 }}>{guide.title}</h1>
        <p style={{ color: "#666", marginTop: 8 }}>
          {guide.destinationCity.province.country.name} · {guide.destinationCity.province.name} · {guide.destinationCity.name}
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <Badge color="#dbeafe" textColor="#1d4ed8">{guide.totalDays}天</Badge>
          <Badge color="#dcfce7" textColor="#16a34a">¥{guide.budgetAmount}/人</Badge>
          <Badge color="#ffedd5" textColor="#c2410c">{guide.transportMode}</Badge>
          <Badge color="#ede9fe" textColor="#6d28d9">{guide.travelStyle}</Badge>
        </div>
      </div>

      <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 24 }}>
        {guide.days.map((day) => (
          <div key={day.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ background: "#f9fafb", padding: "12px 24px", borderBottom: "1px solid #e5e7eb" }}>
              <h3 style={{ fontWeight: "bold", fontSize: 18, margin: 0 }}>
                Day {day.dayNumber} — {day.title}
              </h3>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {day.items.map((item) => (
                  <div key={item.id} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{
                      fontSize: 13, fontFamily: "monospace", color: "#9ca3af",
                      minWidth: 60, paddingTop: 3
                    }}>
                      {item.timeSlot}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "bold" }}>
                        {item.attraction ? (
                          <Link href={`/attraction/${item.attraction.id}`}
                            style={{ color: "#2563eb", textDecoration: "none" }}>
                            {item.attraction.name}
                          </Link>
                        ) : (
                          item.customSpot
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 2 }}>
                        约 {item.durationMin} 分钟
                      </div>
                      {item.ticketReminder && (
                        <div style={{ fontSize: 13, color: "#d97706", marginTop: 4 }}>
                          {item.ticketReminder}
                        </div>
                      )}
                      {item.tips && (
                        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                          {item.tips}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {day.notes && (
                <p style={{ marginTop: 16, color: "#4b5563", fontSize: 14, borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
                  {day.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
        <Link href={`/guides/${guide.id}/chat`}
          style={{
            background: "#7c3aed", color: "white", padding: "12px 24px",
            borderRadius: 12, fontWeight: "bold", textDecoration: "none",
          }}>
          AI 微调此攻略
        </Link>
      </div>
    </div>
  );
}

function Badge({ color, textColor, children }: { color: string; textColor: string; children: React.ReactNode }) {
  return (
    <span style={{
      background: color, color: textColor, padding: "6px 14px",
      borderRadius: 9999, fontSize: 13, fontWeight: 500
    }}>
      {children}
    </span>
  );
}
