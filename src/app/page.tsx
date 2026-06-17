import { prisma } from "@/lib/prisma";
import { PlanProvider } from "@/components/plan/PlanContext";
import SelectionBar from "@/components/plan/SelectionBar";
import CoverOverlay from "@/components/CoverOverlay";
import ChinaMapWrapper from "@/components/china-map/ChinaMapWrapper";

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
      <CoverOverlay />
      <div style={{ height: "calc(100vh - 48px - 56px)", overflow: "hidden" }}>
        <ChinaMapWrapper />
      </div>
      <SelectionBar />
    </PlanProvider>
  );
}
