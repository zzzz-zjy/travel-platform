import Link from "next/link";
import { TIERS } from "@/lib/tiers";

export default function PricingPage() {
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 16px" }}>
      <Link href="/" style={{ color: "#2563eb", textDecoration: "none", fontSize: 14 }}>
        ← 返回首页
      </Link>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: "bold", margin: "16px 0 8px" }}>
          💎 选择适合你的方案
        </h1>
        <p style={{ color: "#666", fontSize: 16 }}>
          从免费开始，随时升级获得更多AI旅行规划能力
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 20,
      }}>
        {TIERS.map((tier) => (
          <div key={tier.key} style={{
            border: `2px solid ${tier.key === "premium" ? tier.color : "#e5e7eb"}`,
            borderRadius: 16, padding: 28,
            background: tier.key === "premium"
              ? "linear-gradient(180deg, #eff6ff 0%, white 40%)"
              : "white",
            position: "relative",
          }}>
            {tier.key === "premium" && (
              <span style={{
                position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                background: "#2563eb", color: "white", padding: "4px 16px",
                borderRadius: 99, fontSize: 12, fontWeight: 700,
              }}>
                最受欢迎
              </span>
            )}
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>
              {tier.name}
            </h2>
            <div style={{ margin: "16px 0" }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: tier.color }}>
                {tier.price}
              </span>
              {tier.price !== "定制" && <span style={{ fontSize: 14, color: "#9ca3af" }}> /月</span>}
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: "24px 0", display: "flex", flexDirection: "column", gap: 10 }}>
              {tier.features.map((f) => (
                <li key={f} style={{ fontSize: 14, color: "#4b5563", display: "flex", gap: 8 }}>
                  <span style={{ color: "#10b981", fontWeight: 700 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button style={{
              width: "100%", padding: "14px 0", borderRadius: 12,
              background: tier.key === "premium"
                ? "linear-gradient(135deg, #2563eb, #7c3aed)"
                : tier.key === "free" ? "#f3f4f6" : "#7c3aed",
              color: tier.key === "free" ? "#374151" : "white",
              fontWeight: 700, fontSize: 15, border: "none",
              cursor: "pointer",
              boxShadow: tier.key === "premium" ? "0 4px 12px rgba(37,99,235,0.3)" : "none",
            }}>
              {tier.key === "free" ? "免费开始" : tier.key === "premium" ? "立即升级" : "联系我们"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
