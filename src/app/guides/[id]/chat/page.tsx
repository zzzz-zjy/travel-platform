import { prisma } from "@/lib/prisma";
import ChatPanel from "@/components/guides/ChatPanel";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function GuideChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guide = await prisma.guide.findUnique({
    where: { id: parseInt(id) },
    include: {
      destinationCity: { include: { province: { include: { country: true } } } },
      days: { include: { items: { include: { attraction: true } } } },
    },
  });
  if (!guide) notFound();

  const guideContext = JSON.stringify(guide.rawJson ? JSON.parse(guide.rawJson) : {
    title: guide.title,
    days: guide.days.map(d => ({
      day: d.dayNumber,
      title: d.title,
      items: d.items.map(i => ({
        time: i.timeSlot,
        spot: i.attraction?.name || i.customSpot,
        duration: i.durationMin,
        tips: i.tips,
      })),
    })),
  }, null, 2);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 16px" }}>
      <Link href={`/guides/${id}`} style={{ color: "#2563eb", textDecoration: "none", fontSize: 14 }}>
        ← 返回攻略详情
      </Link>
      <h1 style={{ fontSize: 22, fontWeight: "bold", marginTop: 16, marginBottom: 24 }}>
        调整攻略：{guide.title}
      </h1>
      <ChatPanel guideJson={guideContext} />
    </div>
  );
}
