import { prisma } from "@/lib/prisma";
import PackingListClient from "@/components/guides/PackingList";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guide = await prisma.guide.findUnique({
    where: { id: parseInt(id) },
    include: {
      destinationCity: { include: { province: { include: { country: true } } } },
    },
  });
  if (!guide) notFound();

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 16px" }}>
      <Link href={`/guides/${id}`} style={{ color: "#2563eb", textDecoration: "none", fontSize: 14 }}>
        ← 返回攻略详情
      </Link>
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginTop: 16, marginBottom: 8 }}>
        🎒 行李清单
      </h1>
      <p style={{ color: "#666", marginTop: 4, marginBottom: 24 }}>
        目的地：{guide.destinationCity.name} · {guide.totalDays}天 · {guide.travelStyle}
      </p>

      <PackingListClient
        cityName={guide.destinationCity.name}
        days={guide.totalDays}
        travelStyle={guide.travelStyle}
      />
    </div>
  );
}
