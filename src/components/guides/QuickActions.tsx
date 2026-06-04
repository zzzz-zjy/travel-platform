"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  guideId: number;
  guideTitle: string;
}

const ACTIONS = [
  {
    key: "save_money",
    label: "💰 省钱方案",
    desc: "替换高价景点为免费替代，优化预算",
    prompt: "请帮我优化这个行程的预算，把高价景点替换为性价比更高的免费或低价替代方案，同时保持游玩体验。",
  },
  {
    key: "simplify",
    label: "📋 精简行程",
    desc: "每天只保留核心2-3个景点",
    prompt: "请帮我精简这个行程，每天只保留最重要的2-3个核心景点，去掉重复或次要的景点，让行程更轻松。",
  },
  {
    key: "add_food",
    label: "🍜 加美食推荐",
    desc: "每天插入本地人推荐的地道美食",
    prompt: "请在这个行程的每一天增加一个本地人推荐的地道美食体验（不是网红店），包括具体的餐厅推荐和招牌菜。",
  },
  {
    key: "replace_niche",
    label: "🔄 小众替代",
    desc: "把热门景点替换为小众隐藏宝地",
    prompt: "请把行程中的热门网红景点替换为本地人常去的小众隐藏宝地，避开游客人流，体验更地道的旅行。",
  },
];

export default function QuickActions({ guideId, guideTitle }: Props) {
  const router = useRouter();
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleAction = (key: string, prompt: string) => {
    setActiveAction(key);
    router.push(`/guides/${guideId}/chat?q=${encodeURIComponent(prompt)}`);
  };

  return (
    <div style={{
      display: "flex", gap: 8, flexWrap: "wrap",
      padding: "16px 0", marginTop: 8,
    }}>
      <span style={{
        fontSize: 12, fontWeight: 600, color: "#9ca3af",
        display: "flex", alignItems: "center", gap: 4, marginRight: 4,
      }}>
        ⚡ 快捷操作
      </span>
      {ACTIONS.map((action) => (
        <button
          key={action.key}
          onClick={() => handleAction(action.key, action.prompt)}
          disabled={activeAction === action.key}
          title={action.desc}
          style={{
            padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500,
            border: "1px solid #e5e7eb", background: activeAction === action.key ? "#eff6ff" : "white",
            color: activeAction === action.key ? "#2563eb" : "#4b5563",
            cursor: activeAction === action.key ? "default" : "pointer",
            opacity: activeAction === action.key ? 0.7 : 1,
            transition: "all 0.15s",
          }}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
