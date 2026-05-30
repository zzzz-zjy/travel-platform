import { prisma } from "@/lib/prisma";
import GuideWizard from "@/components/guides/GuideWizard";

async function getAttractions() {
  const attractions = await prisma.attraction.findMany({
    include: { city: true },
    orderBy: { rating: "desc" },
    take: 30,
  });
  return JSON.parse(JSON.stringify(attractions)).map((a: any) => ({
    id: a.id, name: a.name, cityId: a.cityId, cityName: a.city.name
  }));
}

export default async function NewGuidePage() {
  const attractions = await getAttractions();
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 30, fontWeight: "bold", marginBottom: 32 }}>创建 AI 攻略</h1>
      <GuideWizard attractions={attractions} />
    </div>
  );
}
