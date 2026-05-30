"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MapFAB() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/login") return null;

  return (
    <Link href="/" title="返回地球地图" style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 999,
      width: 52, height: 52, borderRadius: "50%",
      background: "#2563eb", color: "white", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontSize: 24, boxShadow: "0 4px 16px rgba(37,99,235,0.4)",
      textDecoration: "none",
    }}>
      🌍
    </Link>
  );
}
