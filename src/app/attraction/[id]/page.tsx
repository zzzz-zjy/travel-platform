import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getAttraction(id: number) {
  return prisma.attraction.findUnique({
    where: { id },
    include: {
      city: { include: { province: { include: { country: true } } } },
    },
  });
}

const CATEGORY_LABELS: Record<string, string> = {
  nature: "自然风光",
  culture: "人文历史",
  food: "美食探店",
  shopping: "购物",
  adventure: "户外探险",
};

export default async function AttractionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const attr = await getAttraction(parseInt(id));

  if (!attr) {
    return <div style={{ padding: 32 }}>景点未找到</div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <Link
        href={`/explore/${attr.city.province.country.slug}`}
        style={{ color: "#2563eb", textDecoration: "none", fontSize: 14 }}
      >
        ← 返回 {attr.city.province.country.name} 地图
      </Link>

      <div style={{ marginTop: 24 }}>
        <span
          style={{
            fontSize: 13,
            background: "#dbeafe",
            color: "#1d4ed8",
            padding: "4px 12px",
            borderRadius: 9999,
          }}
        >
          {CATEGORY_LABELS[attr.category] || attr.category}
        </span>
        <h1 style={{ fontSize: 30, fontWeight: "bold", marginTop: 12 }}>
          {attr.name}
        </h1>
        <p style={{ color: "#666", marginTop: 8 }}>
          {attr.city.province.name} · {attr.city.name} · ★{" "}
          {attr.rating}
        </p>
      </div>

      <div
        style={{
          marginTop: 32,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
        }}
      >
        <div
          style={{ background: "#f9fafb", borderRadius: 12, padding: 24 }}
        >
          <h2 style={{ fontSize: 18, fontWeight: "bold" }}>
            景点介绍
          </h2>
          <p
            style={{ marginTop: 8, color: "#374151", lineHeight: 1.7 }}
          >
            {attr.description}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{ background: "#fffbeb", borderRadius: 12, padding: 24 }}
          >
            <h2 style={{ fontSize: 18, fontWeight: "bold" }}>
              🎫 门票信息
            </h2>
            <p style={{ marginTop: 8, color: "#374151" }}>
              {attr.ticketInfo}
            </p>
          </div>
          <div
            style={{ background: "#f0fdf4", borderRadius: 12, padding: 24 }}
          >
            <h2 style={{ fontSize: 18, fontWeight: "bold" }}>
              🚇 交通方式
            </h2>
            <p style={{ marginTop: 8, color: "#374151" }}>
              {attr.transportTips}
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <Link
          href={`/guide/new?attraction=${attr.id}`}
          style={{
            display: "inline-block",
            background: "#2563eb",
            color: "white",
            padding: "12px 32px",
            borderRadius: 12,
            fontWeight: "bold",
            textDecoration: "none",
            fontSize: 16,
          }}
        >
          ✨ AI 定制包含此景点的攻略
        </Link>
      </div>
    </div>
  );
}
