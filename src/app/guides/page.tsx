import Link from "next/link";
import { prisma } from "@/lib/prisma";
import GuideList from "@/components/guides/GuideList";

export const dynamic = "force-dynamic";

async function getGuides() {
  const guides = await prisma.guide.findMany({
    include: {
      destinationCity: { include: { province: { include: { country: true } } } },
      days: { include: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return JSON.parse(JSON.stringify(guides));
}

export default async function GuidesPage() {
  const guides = await getGuides();

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ marginBottom: 32 }}>
        <Link href="/explore/cn" style={{ color: "#2563eb", textDecoration: "none", fontSize: 14 }}>
          ← 返回地图
        </Link>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: "bold", margin: 0 }}>攻略广场</h1>
            <p style={{ color: "#666", marginTop: 4 }}>参考他人的行程，找到你的灵感</p>
          </div>
          <Link
            href="/guide/new"
            style={{
              background: "#2563eb", color: "white", padding: "12px 24px",
              borderRadius: 12, fontWeight: "bold", textDecoration: "none",
            }}
          >
            创建我的攻略
          </Link>
        </div>
      </div>
      <GuideList guides={guides} />
    </div>
  );
}
