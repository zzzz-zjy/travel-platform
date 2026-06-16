import Link from "next/link";

export default function ExplorePage() {
  return (
    <div style={{ padding: 24, maxWidth: 768, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, fontFamily: "var(--font-heading)", color: "var(--color-primary)" }}>
        探索革命旧址
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Link href="/timeline" style={{ textDecoration: "none" }}>
          <div style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid #f0e0d0", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
            <div style={{ fontWeight: 600, color: "var(--color-primary)" }}>时间线浏览</div>
            <div style={{ fontSize: 13, color: "var(--color-text-light)", marginTop: 4 }}>按历史时期探索</div>
          </div>
        </Link>
        <Link href="/routes" style={{ textDecoration: "none" }}>
          <div style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid #f0e0d0", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🗺️</div>
            <div style={{ fontWeight: 600, color: "var(--color-primary)" }}>红色路线</div>
            <div style={{ fontSize: 13, color: "var(--color-text-light)", marginTop: 4 }}>经典研学路线</div>
          </div>
        </Link>
        <Link href="/narrator" style={{ textDecoration: "none" }}>
          <div style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid #f0e0d0", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
            <div style={{ fontWeight: 600, color: "var(--color-primary)" }}>AI讲解员</div>
            <div style={{ fontSize: 13, color: "var(--color-text-light)", marginTop: 4 }}>智能历史问答</div>
          </div>
        </Link>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid #f0e0d0", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🗺️</div>
            <div style={{ fontWeight: 600, color: "var(--color-primary)" }}>地图探索</div>
            <div style={{ fontSize: 13, color: "var(--color-text-light)", marginTop: 4 }}>3D中国地图</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
