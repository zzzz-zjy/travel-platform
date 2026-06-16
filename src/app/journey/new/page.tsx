import Link from "next/link";
import JourneyWizard from "@/components/journeys/JourneyWizard";
import { prisma } from "@/lib/prisma";

export default async function NewJourneyPage({
  searchParams,
}: {
  searchParams: Promise<{
    site?: string;
    sites?: string;
    attraction?: string;
    attractions?: string;
    days?: string;
    budget?: string;
    style?: string;
  }>;
}) {
  const params = await searchParams;
  const siteIds = (params.sites || params.attractions || "").split(",").map(Number).filter((n) => !isNaN(n));
  const singleSiteId = parseInt(params.site || params.attraction || "");

  const days = params.days || "";
  const budget = params.budget || "";
  const style = params.style || "";

  let initialPrompt: string | undefined;

  const extra = [`${days}天`, `人均预算${budget}元`, style ? `偏好${style}风格` : ""]
    .filter(Boolean)
    .join("，");

  if (siteIds.length > 0) {
    const sites = await prisma.site.findMany({
      where: { id: { in: siteIds } },
      include: { city: { include: { province: true } } },
    });
    if (sites.length > 0) {
      const ordered = sites
        .sort((a, b) => siteIds.indexOf(a.id) - siteIds.indexOf(b.id))
        .map((a) => a.name)
        .join("、");
      const first = sites[0];
      const province = first.city.province.name;
      const sameProv = sites.every((a) => a.city.province.name === province);
      const sameCity = sameProv && sites.every((a) => a.city.name === first.city.name);
      const loc = sameCity ? `${province}${first.city.name}` : sameProv ? province : province;
      initialPrompt = `我想去${loc}，包含以下旧址：${ordered}。${extra ? extra + "。" : ""}帮我规划一个包含这些旧址的红色研学路线。`;
      if (extra) {
        initialPrompt = `我想去${loc}，${extra}。包含以下旧址：${ordered}。帮我直接生成一个包含这些旧址的${days}天详细红色研学路线，不要询问。`;
      }
    }
  } else if (!isNaN(singleSiteId)) {
    const site = await prisma.site.findUnique({
      where: { id: singleSiteId },
      include: { city: { include: { province: true } } },
    });
    if (site) {
      if (extra) {
        initialPrompt = `我想去${site.city.province.name}${site.city.name}，${extra}。必须包含${site.name}这个旧址。帮我直接生成一个${days}天详细红色研学路线，不要询问。`;
      } else {
        initialPrompt = `我想去${site.city.province.name}${site.city.name}的${site.name}，帮我规划一个包含这个旧址的红色研学路线`;
      }
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <Link href="/explore" style={{ color: "#C41E3A", textDecoration: "none", fontSize: 14 }}>
        ← 返回探索
      </Link>
      <h1 style={{ fontSize: 30, fontWeight: "bold", marginTop: 16, marginBottom: 32 }}>创建 AI 红色研学路线</h1>
      <JourneyWizard initialPrompt={initialPrompt} />
    </div>
  );
}
