"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname === "/") return null;
  if (pathname === "/login") return null;

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
        <nav style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/guides" style={{
            fontSize: 14, fontWeight: 500,
            color: pathname.startsWith("/guides") ? "#2563eb" : "#4b5563",
            textDecoration: "none",
          }}>
            攻略广场
          </Link>
          <Link href="/my" style={{
            fontSize: 14, fontWeight: 500,
            color: pathname.startsWith("/my") ? "#2563eb" : "#4b5563",
            textDecoration: "none",
          }}>
            我的攻略
          </Link>
          <Link href="/guide/new" style={{
            background: "#2563eb", color: "white", padding: "8px 16px",
            borderRadius: 8, fontSize: 14, fontWeight: "bold", textDecoration: "none",
          }}>
            ✨ AI 定制
          </Link>

          {session?.user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 8, paddingLeft: 16, borderLeft: "1px solid #e5e7eb" }}>
              <span style={{ fontSize: 13, color: "#374151" }}>
                {session.user.name || session.user.email}
              </span>
              <button onClick={() => signOut()} style={{
                fontSize: 12, color: "#9ca3af", background: "none", border: "none",
                cursor: "pointer", padding: 0,
              }}>
                退出
              </button>
            </div>
          ) : (
            <Link href="/login" style={{
              fontSize: 13, color: "#6b7280", textDecoration: "none",
              marginLeft: 8, paddingLeft: 16, borderLeft: "1px solid #e5e7eb",
            }}>
              登录
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
