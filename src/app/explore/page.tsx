import { prisma } from "@/lib/prisma";
import { PlanProvider } from "@/components/plan/PlanContext";
import SelectionBar from "@/components/plan/SelectionBar";
import dynamic from "next/dynamic";

const ChinaMapScene = dynamic(() => import("@/components/china-map/ChinaMapScene"), {
  ssr: false,
  loading: () => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "calc(100vh - 48px - 56px)", background: "#0a0202",
      color: "#D4A574", fontSize: 16,
    }}>加载中...</div>
  ),
});

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
        <ChinaMapScene />
      </div>
      <SelectionBar />
    </PlanProvider>
  );
}
