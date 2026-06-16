import type { Metadata } from "next";
import Header from "@/components/ui/Header";
import Providers from "@/components/Providers";
import BottomNav from "@/components/ui/BottomNav";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "红色记忆 — 革命旧址与博物馆数字教育平台",
  description: "通过3D中国地图探索革命旧址，AI讲解员带你深度了解革命历史",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
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
