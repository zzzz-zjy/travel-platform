import type { Metadata } from "next";
import Header from "@/components/ui/Header";
import Providers from "@/components/Providers";
import BottomNav from "@/components/ui/BottomNav";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "青途智红 — AI赋能青年学子革命旧址沉浸式研学育人平台",
  description: "通过3D中国地图探索革命旧址，AI讲解员带你沉浸式研学革命历史",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700;900&family=Noto+Sans+SC:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen" style={{ background: "var(--color-bg)", color: "var(--color-text)" }}>
        <Providers>
          <Header />
          <main className="pb-16">{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
