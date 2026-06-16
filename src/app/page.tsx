import dynamic from "next/dynamic";

const ChinaMapScene = dynamic(() => import("@/components/china-map/ChinaMapScene"), {
  ssr: false,
  loading: () => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "calc(100vh - 56px - 56px)",
      background: "linear-gradient(180deg, #8B0000 0%, #C41E3A 100%)",
      color: "white", fontSize: 16,
    }}>
      地图加载中...
    </div>
  ),
});

export default function Home() {
  return <ChinaMapScene />;
}
