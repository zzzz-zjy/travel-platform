import { prisma } from "@/lib/prisma";
import { PlanProvider } from "@/components/plan/PlanContext";
import ChinaMapWrapper from "@/components/china-map/ChinaMapWrapper";

export default async function ExplorePage() {
  const sites = await prisma.site.findMany({
    select: {
      id: true, name: true, siteType: true, lat: true, lng: true, rating: true,
      era: { select: { name: true, color: true } },
      city: { select: { name: true, province: { select: { name: true } } } },
    },
  });

  return (
    <PlanProvider sites={sites}>
      <div style={{
        position: "fixed", top: 42, bottom: 56, left: 0, right: 0,
        overflow: "hidden",
      }}>
        <ChinaMapWrapper />
      </div>
    </PlanProvider>
  );
}
