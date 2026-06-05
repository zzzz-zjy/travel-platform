"use client";

import { useEffect, useState } from "react";
import { getSpotStatus, SpotStatus, getWeatherAlerts, WeatherAlert } from "@/lib/realtime-data";

export function SpotStatusBadge({ spotName, spotId, targetDate }: { spotName: string; spotId?: number; targetDate?: string }) {
  const [status, setStatus] = useState<SpotStatus | null>(null);

  useEffect(() => {
    setStatus(getSpotStatus(spotName, spotId, targetDate));
  }, [spotName, spotId, targetDate]);

  if (!status) return null;

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 500,
      background: status.isOpen ? (status.crowdLevel === "high" ? "#fef3c7" : "#d1fae5") : "#fee2e2",
      color: status.isOpen ? (status.crowdLevel === "high" ? "#d97706" : "#059669") : "#dc2626",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: status.isOpen ? (status.crowdLevel === "high" ? "#f59e0b" : "#10b981") : "#ef4444",
        display: "inline-block",
      }} />
      {status.statusText}
      {status.isOpen && ` · ${status.crowdText}`}
    </span>
  );
}

export function WeatherAlertBanner({ cityName }: { cityName: string }) {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);

  useEffect(() => {
    setAlerts(getWeatherAlerts(cityName));
  }, [cityName]);

  if (!alerts.length) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {alerts.map((alert, i) => (
        <div key={i} style={{
          padding: "10px 16px", borderRadius: 10, fontSize: 13,
          background: alert.level === "orange" ? "#fef3c7" : alert.level === "yellow" ? "#fef9c3" : "#dbeafe",
          color: alert.level === "orange" ? "#92400e" : alert.level === "yellow" ? "#854d0e" : "#1e40af",
          border: `1px solid ${alert.level === "orange" ? "#fde68a" : alert.level === "yellow" ? "#fef08a" : "#bfdbfe"}`,
        }}>
          {alert.icon} {alert.message}
        </div>
      ))}
    </div>
  );
}

/** 景点详情页面使用的完整状态卡片 */
export function AttractionStatusClient({ spotName, spotId }: { spotName: string; spotId: number }) {
  const [status, setStatus] = useState<SpotStatus | null>(null);

  useEffect(() => {
    setStatus(getSpotStatus(spotName, spotId));
  }, [spotName, spotId]);

  if (!status) return null;

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 500,
      background: "rgba(255,255,255,0.25)", backdropFilter: "blur(4px)",
      color: "white",
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: status.isOpen ? (status.crowdLevel === "high" ? "#f59e0b" : "#10b981") : "#ef4444",
        display: "inline-block",
      }} />
      {status.isOpen ? "营业中" : "已闭园"} · {status.crowdText} · {status.weather} {status.temp}°C
    </span>
  );
}

export function AuthenticityBadge({ type }: { type?: string }) {
  if (!type) return null;
  const config: Record<string, { label: string; color: string; bg: string }> = {
    local: { label: "🏠 本地推荐", color: "#059669", bg: "#d1fae5" },
    popular: { label: "📸 热门景点", color: "#d97706", bg: "#fef3c7" },
    hidden_gem: { label: "💎 小众宝藏", color: "#7c3aed", bg: "#ede9fe" },
    tourist_trap: { label: "⚠️ 避坑提醒", color: "#dc2626", bg: "#fee2e2" },
  };
  const c = config[type] || config.local;
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 500,
      background: c.bg, color: c.color,
    }}>
      {c.label}
    </span>
  );
}
