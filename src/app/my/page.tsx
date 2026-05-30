import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import GuideList from "@/components/guides/GuideList";

export default async function MyGuidesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  const guides = await prisma.guide.findMany({
    where: { userId },
    include: {
      destinationCity: { include: { province: { include: { country: true } } } },
      days: { include: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = JSON.parse(JSON.stringify(guides));

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: "bold", margin: 0 }}>我的攻略</h1>
          <p style={{ color: "#666", marginTop: 4 }}>我通过 AI 生成的所有旅行攻略</p>
        </div>
        <Link href="/guide/new" style={{
          background: "#2563eb", color: "white", padding: "12px 24px",
          borderRadius: 12, fontWeight: "bold", textDecoration: "none",
        }}>
          ✨ 创建新攻略
        </Link>
      </div>

      {serialized.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80 }}>
          <p style={{ fontSize: 48, margin: 0 }}>📝</p>
          <p style={{ color: "#9ca3af", marginTop: 16, fontSize: 16 }}>还没有生成任何攻略</p>
          <Link href="/guide/new" style={{
            display: "inline-block", marginTop: 16, background: "#2563eb",
            color: "white", padding: "12px 24px", borderRadius: 12,
            fontWeight: "bold", textDecoration: "none",
          }}>立即创建</Link>
        </div>
      ) : (
        <GuideList guides={serialized} />
      )}
    </div>
  );
}
