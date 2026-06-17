import { prisma } from "@/lib/prisma";
import { PlanProvider } from "@/components/plan/PlanContext";
import PlanMapWrapper from "@/components/plan/PlanMapWrapper";
import PlanPanel from "@/components/plan/PlanPanel";
import SelectionBar from "@/components/plan/SelectionBar";
import CoverOverlay from "@/components/CoverOverlay";

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

      <div style={{ display: "flex", height: "calc(100vh - 48px - 56px)", overflow: "hidden" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <PlanMapWrapper />
        </div>

        <div style={{ width: 300, minWidth: 300, padding: "12px" }}>
          <PlanPanel />
        </div>
      </div>

      <SelectionBar />
    </PlanProvider>
  );
}
