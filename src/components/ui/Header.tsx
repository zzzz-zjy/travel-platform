"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  // Don't show header on globe homepage
  if (pathname === "/") return null;

  return (
    <header style={{
      height: 64, borderBottom: "1px solid #e5e7eb",
      background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 16px",
        height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{
          fontWeight: "bold", fontSize: 20, color: "#2563eb", textDecoration: "none",
        }}>
          🌍 旅行攻略
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link href="/guides" style={{
            fontSize: 14, fontWeight: 500,
            color: pathname.startsWith("/guides") ? "#2563eb" : "#4b5563",
            textDecoration: "none",
          }}>
            攻略广场
          </Link>
          <Link href="/guide/new" style={{
            background: "#2563eb", color: "white", padding: "8px 16px",
            borderRadius: 8, fontSize: 14, fontWeight: "bold", textDecoration: "none",
          }}>
            ✨ 创建攻略
          </Link>
        </nav>
      </div>
    </header>
  );
}
