import { prisma } from "@/lib/prisma";
import { PlanProvider } from "@/components/plan/PlanContext";
import HomeContent from "@/components/HomeContent";

export const dynamic = "force-dynamic";

export default async function Home() {
  const sites = await prisma.site.findMany({
    select: {
      id: true, name: true, siteType: true, lat: true, lng: true, rating: true,
      era: { select: { name: true, color: true } },
      city: { select: { name: true, province: { select: { name: true } } } },
    },
  });

  return (
    <PlanProvider sites={sites}>
      <HomeContent />
    </PlanProvider>
  );
}
