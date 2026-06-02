import Link from "next/link";
import GuideWizard from "@/components/guides/GuideWizard";
import { prisma } from "@/lib/prisma";

export default async function NewGuidePage({
  searchParams,
}: {
  searchParams: Promise<{
    attraction?: string;
    attractions?: string;
    days?: string;
    budget?: string;
    style?: string;
  }>;
}) {
  const params = await searchParams;
  const days = params.days || "";
  const budget = params.budget || "";
  const style = params.style || "";

  let initialPrompt: string | undefined;

  const extra = [`${days}天`, `人均预算${budget}元`, style ? `偏好${style}风格` : ""]
    .filter(Boolean)
    .join("，");

  if (params.attractions) {
    const ids = params.attractions.split(",").map(Number).filter((n) => !isNaN(n));
    if (ids.length > 0) {
      const attrs = await prisma.attraction.findMany({
        where: { id: { in: ids } },
        include: { city: { include: { province: true } } },
      });
      if (attrs.length > 0) {
        const ordered = attrs
          .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
          .map((a) => a.name)
          .join("、");
        const first = attrs[0];
        const province = first.city.province.name;
        const sameProv = attrs.every((a) => a.city.province.name === province);
        const sameCity = sameProv && attrs.every((a) => a.city.name === first.city.name);
        const loc = sameCity ? `${province}${first.city.name}` : sameProv ? province : province;
        initialPrompt = `我想去${loc}，包含以下景点：${ordered}。${extra ? extra + "。" : ""}帮我规划一个包含这些景点的旅行攻略。`;
        if (extra) {
          initialPrompt = `我想去${loc}，${extra}。包含以下景点：${ordered}。帮我直接生成一个包含这些景点的${days}天详细旅行攻略，不要询问。`;
        }
      }
    }
  } else if (params.attraction) {
    const attr = await prisma.attraction.findUnique({
      where: { id: parseInt(params.attraction) },
      include: { city: { include: { province: true } } },
    });
    if (attr) {
      if (extra) {
        initialPrompt = `我想去${attr.city.province.name}${attr.city.name}，${extra}。必须包含${attr.name}这个景点。帮我直接生成一个${days}天详细旅行攻略，不要询问。`;
      } else {
        initialPrompt = `我想去${attr.city.province.name}${attr.city.name}的${attr.name}，帮我规划一个包含这个景点的旅行攻略`;
      }
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <Link href="/explore/cn" style={{ color: "#2563eb", textDecoration: "none", fontSize: 14 }}>
        ← 返回地图
      </Link>
      <h1 style={{ fontSize: 30, fontWeight: "bold", marginTop: 16, marginBottom: 32 }}>创建 AI 攻略</h1>
      <GuideWizard initialPrompt={initialPrompt} />
    </div>
  );
}
