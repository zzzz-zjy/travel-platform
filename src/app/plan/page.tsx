import { prisma } from "@/lib/prisma";
import { PlanProvider } from "@/components/plan/PlanContext";
import PlanMap from "@/components/plan/PlanMap";
import PlanPanel from "@/components/plan/PlanPanel";
import SelectionBar from "@/components/plan/SelectionBar";

export default async function PlanPage() {
  const sites = await prisma.site.findMany({
    select: {
      id: true, name: true, siteType: true, lat: true, lng: true, rating: true,
      era: { select: { name: true, color: true } },
      city: { select: { name: true, province: { select: { name: true } } } },
    },
  });

  return (
    <PlanProvider sites={sites}>
      <div style={{ display: "flex", height: "calc(100vh - 48px - 56px)", overflow: "hidden" }}>
        {/* 左侧地图 */}
        <div style={{ flex: 1, position: "relative" }}>
          <PlanMap />
        </div>

        {/* 右侧面板 */}
        <div style={{ width: 300, minWidth: 300, padding: "12px" }}>
          <PlanPanel />
        </div>
      </div>

      <SelectionBar />
    </PlanProvider>
  );
}
