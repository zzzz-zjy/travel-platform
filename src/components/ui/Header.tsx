"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40,
      background: "linear-gradient(135deg, #8B0000 0%, #C41E3A 100%)",
      color: "white", padding: "10px 16px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {!isHome && (
          <>
            <button onClick={() => router.back()} style={{
              background: "rgba(255,255,255,0.15)", color: "white",
              border: "1px solid rgba(255,255,255,0.25)", borderRadius: 6,
              padding: "4px 10px", fontSize: 13, cursor: "pointer",
            }}>
              ← 返回
            </button>
            <Link href="/" style={{
              background: "rgba(255,255,255,0.15)", color: "white",
              border: "1px solid rgba(255,255,255,0.25)", borderRadius: 6,
              padding: "4px 10px", fontSize: 13, textDecoration: "none",
            }}>
              🗺️ 地图
            </Link>
          </>
        )}
        <Link href="/" style={{ textDecoration: "none", color: "white" }}>
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, fontFamily: "var(--font-heading)" }}>
            青途智红
          </h1>
        </Link>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {user ? (
          <>
            <span style={{ fontSize: 13, opacity: 0.9 }}>{user.name}</span>
            <button onClick={logout} style={{
              background: "rgba(255,255,255,0.2)", color: "white",
              border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6,
              padding: "4px 10px", fontSize: 12, cursor: "pointer",
            }}>
              退出
            </button>
          </>
        ) : (
          <Link href="/login" style={{ color: "white", fontSize: 13, textDecoration: "none" }}>
            登录
          </Link>
        )}
      </div>
    </header>
  );
}
