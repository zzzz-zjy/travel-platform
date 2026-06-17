import { prisma } from "@/lib/prisma";
import { PlanProvider } from "@/components/plan/PlanContext";
import SelectionBar from "@/components/plan/SelectionBar";
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
      <div style={{ height: "calc(100vh - 48px - 56px)", overflow: "hidden" }}>
        <ChinaMapWrapper />
      </div>
      <SelectionBar />
    </PlanProvider>
  );
}
