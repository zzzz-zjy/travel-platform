"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (search.length < 2) { setResults(null); setOpen(false); return; }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(search)}`);
      setResults(await res.json());
      setOpen(true);
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  if (pathname === "/") return null;
  if (pathname === "/login") return null;

  return (
    <header style={{ height: 64, borderBottom: "1px solid #e5e7eb", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontWeight: "bold", fontSize: 20, color: "#2563eb", textDecoration: "none", flexShrink: 0 }}>🌍 旅行攻略</Link>

        <div ref={ref} style={{ position: "relative", flex: 1, maxWidth: 360, margin: "0 24px" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && search) router.push(`/explore/cn?q=${encodeURIComponent(search)}`); }} placeholder="搜索景点、城市、攻略..." style={{ width: "100%", padding: "8px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          {open && results && (
            <div style={{ position: "absolute", top: 42, left: 0, right: 0, background: "white", borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.15)", maxHeight: 400, overflowY: "auto", zIndex: 100, padding: 8 }}>
              {results.attractions?.length === 0 && results.guides?.length === 0 && <p style={{ padding: 16, color: "#9ca3af", fontSize: 14, textAlign: "center" }}>无结果</p>}
              {results.attractions?.length > 0 && (<div><div style={{ padding: "8px 12px", fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>景点</div>{results.attractions.map((a: any) => (<div key={a.id} onClick={() => { router.push(`/attraction/${a.id}`); setOpen(false); }} style={{ padding: "10px 12px", borderRadius: 8, cursor: "pointer", display: "flex", justifyContent: "space-between" }}><div><div style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</div><div style={{ fontSize: 12, color: "#6b7280" }}>{a.city?.province?.country?.name} · {a.city?.name}</div></div><span style={{ fontSize: 12, color: "#f59e0b" }}>★ {a.rating}</span></div>))}</div>)}
              {results.guides?.length > 0 && (<div><div style={{ padding: "8px 12px", fontSize: 11, color: "#9ca3af", fontWeight: 600, borderTop: results.attractions?.length ? "1px solid #f3f4f6" : "none" }}>攻略</div>{results.guides.map((g: any) => (<div key={g.id} onClick={() => { router.push(`/guides/${g.id}`); setOpen(false); }} style={{ padding: "10px 12px", borderRadius: 8, cursor: "pointer" }}><div style={{ fontWeight: 600, fontSize: 14 }}>{g.title}</div><div style={{ fontSize: 12, color: "#6b7280" }}>{g.destinationCity?.province?.country?.name} · {g.destinationCity?.name}</div></div>))}</div>)}
            </div>
          )}
        </div>

        <nav style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/guides" style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", color: pathname.startsWith("/guides") ? "#2563eb" : "#4b5563", textDecoration: "none" }}>攻略广场</Link>
          <Link href="/my" style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", color: pathname.startsWith("/my") ? "#2563eb" : "#4b5563", textDecoration: "none" }}>我的攻略</Link>
          <Link href="/guide/new" style={{ background: "#2563eb", color: "white", padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: "bold", textDecoration: "none", whiteSpace: "nowrap" }}>✨ AI 定制</Link>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 12, borderLeft: "1px solid #e5e7eb" }}>
              <span style={{ fontSize: 12, color: "#374151" }}>{user.name || user.phone}</span>
              <button onClick={logout} style={{ fontSize: 12, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: 0 }}>退出</button>
            </div>
          ) : (
            <Link href="/login" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none", paddingLeft: 12, borderLeft: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>登录</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
