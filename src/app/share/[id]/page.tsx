import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guide = await prisma.guide.findUnique({
    where: { id: parseInt(id) },
    include: {
      destinationCity: { include: { province: { include: { country: true } } } },
      days: {
        orderBy: { dayNumber: "asc" },
        include: { items: { orderBy: { timeSlot: "asc" } } },
      },
    },
  });
  if (!guide) notFound();

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
      <p style={{ color: "#9ca3af", fontSize: 13 }}>分享自 🌍 旅行攻略</p>
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginTop: 8 }}>{guide.title}</h1>
      <p style={{ color: "#6b7280", marginTop: 4 }}>
        {guide.destinationCity.province.country.name} · {guide.destinationCity.province.name} · {guide.destinationCity.name}
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 16, marginBottom: 32 }}>
        <span style={{ fontSize: 13, background: "#dbeafe", padding: "4px 12px", borderRadius: 9999 }}>
          📅 {guide.totalDays}天
        </span>
        <span style={{ fontSize: 13, background: "#dcfce7", padding: "4px 12px", borderRadius: 9999 }}>
          💰 ¥{guide.budgetAmount}/人
        </span>
        <span style={{ fontSize: 13, background: "#ede9fe", padding: "4px 12px", borderRadius: 9999 }}>
          {guide.travelStyle}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {guide.days.map((day) => (
          <div key={day.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ background: "#f9fafb", padding: "12px 20px", borderBottom: "1px solid #e5e7eb" }}>
              <h3 style={{ fontWeight: "bold", margin: 0 }}>Day {day.dayNumber} — {day.title}</h3>
            </div>
            <div style={{ padding: 20 }}>
              {day.items.map((item) => (
                <div key={item.id} style={{ display: "flex", gap: 12, padding: "8px 0" }}>
                  <span style={{ fontSize: 13, color: "#9ca3af", minWidth: 55, fontFamily: "monospace" }}>
                    {item.timeSlot}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.customSpot}</div>
                    {item.tips && <div style={{ fontSize: 13, color: "#6b7280" }}>{item.tips}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 32, textAlign: "center" }}>
        <Link href="/" style={{
          background: "#2563eb", color: "white", padding: "14px 32px",
          borderRadius: 12, fontWeight: "bold", textDecoration: "none", display: "inline-block",
        }}>
          🌍 我也要定制攻略
        </Link>
      </div>
    </div>
  );
}
