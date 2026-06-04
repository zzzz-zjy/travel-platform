"use client";

import { useMemo, useState } from "react";
import { generatePackingList, PackingCategory } from "@/lib/packing-rules";

interface Props {
  cityName: string;
  days: number;
  travelStyle: string;
}

export default function PackingListClient({ cityName, days, travelStyle }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const categories = useMemo(
    () => generatePackingList(cityName, days, travelStyle),
    [cityName, days, travelStyle]
  );

  const toggle = (item: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);
  const checkedCount = categories.reduce(
    (sum, c) => sum + c.items.filter((i) => checked.has(i)).length, 0
  );

  return (
    <div>
      {/* 进度条 */}
      <div style={{
        marginBottom: 24, padding: 16, background: "#f0fdf4",
        borderRadius: 12, border: "1px solid #bbf7d0",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#166534" }}>
            📋 准备进度
          </span>
          <span style={{ fontSize: 14, color: "#166534", fontWeight: 600 }}>
            {checkedCount} / {totalItems}
          </span>
        </div>
        <div style={{ height: 6, background: "#bbf7d0", borderRadius: 3, overflow: "hidden" }}>
          <div style={{
            height: "100%", background: "#16a34a", borderRadius: 3,
            width: `${totalItems > 0 ? (checkedCount / totalItems) * 100 : 0}%`,
            transition: "width 0.3s ease",
          }} />
        </div>
      </div>

      {/* 分类清单 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {categories.map((cat) => (
          <div key={cat.category}>
            <h3 style={{
              fontSize: 16, fontWeight: 700, margin: "0 0 10px",
              color: "#1f2937",
            }}>
              {cat.icon} {cat.category}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {cat.items.map((item) => (
                <label key={item} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 12px", borderRadius: 8, cursor: "pointer",
                  background: checked.has(item) ? "#f0fdf4" : "#f9fafb",
                  border: `1px solid ${checked.has(item) ? "#bbf7d0" : "#e5e7eb"}`,
                  transition: "all 0.15s",
                  textDecoration: checked.has(item) ? "line-through" : "none",
                  color: checked.has(item) ? "#9ca3af" : "#374151",
                  fontSize: 14,
                }}>
                  <input
                    type="checkbox"
                    checked={checked.has(item)}
                    onChange={() => toggle(item)}
                    style={{ accentColor: "#16a34a", width: 16, height: 16 }}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
