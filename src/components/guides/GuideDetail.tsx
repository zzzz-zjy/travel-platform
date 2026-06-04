"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import BudgetBreakdown from "./BudgetBreakdown";
import QuickActions from "./QuickActions";
import ExportButton from "./ExportButton";
import { SpotStatusBadge, WeatherAlertBanner } from "@/components/ui/RealtimeBadge";

interface GuideWithDays {
  id: number;
  title: string;
  totalDays: number;
  budgetAmount: number;
  transportMode: string;
  travelStyle: string;
  destinationCity: {
    name: string;
    province: { name: string; country: { name: string; slug: string } };
  };
  days: {
    id: number; dayNumber: number; title: string; notes: string | null;
    items: {
      id: number; timeSlot: string; durationMin: number;
      customSpot: string | null; ticketReminder: string | null; tips: string | null;
      attraction: { id: number; name: string; category: string } | null;
    }[];
  }[];
}

export default function GuideDetail({ guide, isOwner }: { guide: GuideWithDays; isOwner?: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(guide.title);
  const [saved, setSaved] = useState(guide.title);

  const saveTitle = async () => {
    await fetch(`/api/guides/${guide.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setSaved(title);
    setEditing(false);
  };

  const deleteGuide = async () => {
    if (!confirm("确定要删除这个攻略吗？此操作不可恢复。")) return;
    await fetch(`/api/guides/${guide.id}`, { method: "DELETE" });
    router.push("/my");
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px 80px" }}>
      <Link href="/guides" style={{ color: "#2563eb", textDecoration: "none", fontSize: 14 }}>
        ← 返回攻略广场
      </Link>

      <div style={{ marginTop: 4 }}>
        <Link href={`/explore/${guide.destinationCity?.province?.country?.slug || "cn"}`} style={{
          color: "#2563eb", textDecoration: "none", fontSize: 13,
        }}>
          🗺️ 在地图上查看 {guide.destinationCity?.name || "目的地"}
        </Link>
      </div>

      {/* 天气预警 */}
      {guide.destinationCity?.name && (
        <div style={{ marginTop: 12 }}>
          <WeatherAlertBanner cityName={guide.destinationCity.name} />
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        {editing ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={{
              fontSize: 30, fontWeight: "bold", border: "1px solid #d1d5db",
              borderRadius: 8, padding: "4px 12px", flex: 1,
            }} autoFocus />
            <button onClick={saveTitle} style={{
              padding: "8px 16px", background: "#2563eb", color: "white",
              border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14,
            }}>保存</button>
            <button onClick={() => { setTitle(saved); setEditing(false); }} style={{
              padding: "8px 16px", background: "#e5e7eb", border: "none",
              borderRadius: 8, cursor: "pointer", fontSize: 14,
            }}>取消</button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 30, fontWeight: "bold", margin: 0 }}>{saved}</h1>
            {isOwner && (
              <button onClick={() => setEditing(true)} style={{
                fontSize: 12, color: "#9ca3af", background: "none", border: "none",
                cursor: "pointer", padding: "4px 8px",
              }}>✏️ 编辑</button>
            )}
          </div>
        )}
        <p style={{ color: "#666", marginTop: 8 }}>
          {guide.destinationCity.province.country.name} · {guide.destinationCity.province.name} · {guide.destinationCity.name}
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <Badge color="#dbeafe" textColor="#1d4ed8">{guide.totalDays}天</Badge>
          <Badge color="#dcfce7" textColor="#16a34a">¥{guide.budgetAmount}/人</Badge>
          <Badge color="#ffedd5" textColor="#c2410c">{guide.transportMode}</Badge>
          <Badge color="#ede9fe" textColor="#6d28d9">{guide.travelStyle}</Badge>
        </div>
      </div>

      {/* 快捷操作按钮 */}
      <QuickActions guideId={guide.id} guideTitle={saved} />

      {/* 按天展示行程 */}
      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 24 }}>
        {guide.days.map((day) => (
          <div key={day.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ background: "#f9fafb", padding: "12px 24px", borderBottom: "1px solid #e5e7eb" }}>
              <h3 style={{ fontWeight: "bold", fontSize: 18, margin: 0 }}>
                Day {day.dayNumber} — {day.title}
              </h3>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {day.items.map((item) => (
                  <div key={item.id} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{
                      fontSize: 13, fontFamily: "monospace", color: "#9ca3af",
                      minWidth: 60, paddingTop: 3
                    }}>
                      {item.timeSlot}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        {item.attraction ? (
                          <Link href={`/attraction/${item.attraction.id}`}
                            style={{ color: "#2563eb", textDecoration: "none" }}>
                            {item.attraction.name}
                          </Link>
                        ) : (
                          <span>{item.customSpot}</span>
                        )}
                        <SpotStatusBadge
                          spotName={item.attraction?.name || item.customSpot || ""}
                          spotId={item.attraction?.id}
                        />
                      </div>
                      <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 2 }}>
                        约 {item.durationMin} 分钟
                      </div>
                      {item.ticketReminder && (
                        <div style={{ fontSize: 13, color: "#d97706", marginTop: 4 }}>
                          🎫 {item.ticketReminder}
                        </div>
                      )}
                      {item.tips && (
                        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                          💡 {item.tips}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {day.notes && (
                <p style={{ marginTop: 16, color: "#4b5563", fontSize: 14, borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
                  {day.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 预算明细面板 */}
      <BudgetBreakdown
        budgetAmount={guide.budgetAmount}
        days={guide.days}
        totalDays={guide.totalDays}
      />

      {/* 底部操作栏 */}
      <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <Link href={`/guides/${guide.id}/chat`}
          style={{
            background: "#7c3aed", color: "white", padding: "12px 24px",
            borderRadius: 12, fontWeight: "bold", textDecoration: "none",
          }}>
          💬 AI 微调
        </Link>
        <Link href={`/guides/${guide.id}/packing`}
          style={{
            background: "#059669", color: "white", padding: "12px 24px",
            borderRadius: 12, fontWeight: "bold", textDecoration: "none",
          }}>
          🎒 行李清单
        </Link>
        <Link href={`/guides/${guide.id}/travelogue`}
          style={{
            background: "#d97706", color: "white", padding: "12px 24px",
            borderRadius: 12, fontWeight: "bold", textDecoration: "none",
          }}>
          📖 生成游记
        </Link>
        <ExportButton title={saved} />
        <FavoriteButton guideId={guide.id} />
        {isOwner && (
          <button onClick={deleteGuide} style={{
            background: "#fee2e2", color: "#dc2626", padding: "12px 24px",
            borderRadius: 12, fontWeight: "bold", border: "none", cursor: "pointer",
          }}>
            🗑️ 删除
          </button>
        )}
      </div>
    </div>
  );
}

function FavoriteButton({ guideId }: { guideId: number }) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [faved, setFaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !token) return;
    fetch(`/api/favorites?guideId=${guideId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.favorited !== undefined) setFaved(d.favorited); })
      .catch(() => {});
  }, [guideId, user, token]);

  const toggle = async () => {
    if (!user) { router.push("/login"); return; }
    if (loading) return;
    setLoading(true);
    try {
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers,
        body: JSON.stringify({ guideId }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.favorited !== undefined) setFaved(data.favorited);
    } catch {} finally {
      setLoading(false);
    }
  };
  return (
    <button onClick={toggle} disabled={loading} style={{
      background: faved ? "#fef3c7" : "#f3f4f6", color: faved ? "#d97706" : "#4b5563",
      padding: "12px 24px", borderRadius: 12, fontWeight: "bold",
      border: "none", cursor: loading ? "default" : "pointer",
      opacity: loading ? 0.6 : 1,
    }}>
      {faved ? "⭐ 已收藏" : "☆ 收藏"}
    </button>
  );
}

function Badge({ color, textColor, children }: { color: string; textColor: string; children: React.ReactNode }) {
  return (
    <span style={{
      background: color, color: textColor, padding: "6px 14px",
      borderRadius: 9999, fontSize: 13, fontWeight: 500
    }}>
      {children}
    </span>
  );
}
