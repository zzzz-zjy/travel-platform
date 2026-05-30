import type { Metadata } from "next";
import Header from "@/components/ui/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "旅行攻略 — AI 智能规划你的完美行程",
  description: "通过 3D 地球选择目的地，AI 帮你生成个性化旅游攻略",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body style={{ minHeight: "100vh", background: "white", color: "#111827", margin: 0 }}>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
