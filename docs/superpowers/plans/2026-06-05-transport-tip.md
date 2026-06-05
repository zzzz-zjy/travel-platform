# Transport Tip 交通信息保存与展示 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 AI 已生成的 transportTip 交通信息保存到数据库并展示在攻略详情页。

**Architecture:** 在 GuideItem 模型加一个可选字符串字段 transportTip，串联 3 个环节：AI JSON 解析 → API 存储 → UI 渲染。不改 AI prompt，不做结构化拆分。

**Tech Stack:** Next.js 16, Prisma 7, React 19, TypeScript

---

### Task 1: Prisma Schema 添加 transportTip 字段

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: 在 GuideItem 模型中添加字段**

在 GuideItem 模型的 `tips` 字段之后（第 127 行），添加：

```prisma
transportTip  String?  @map("transport_tip")
```

修改后的模型片段：
```prisma
model GuideItem {
  id             Int         @id @default(autoincrement())
  guideDayId     Int         @map("guide_day_id")
  attractionId   Int?        @map("attraction_id")
  timeSlot       String      @map("time_slot")
  customSpot     String?     @map("custom_spot")
  durationMin    Int         @map("duration_min")
  ticketReminder String?     @map("ticket_reminder")
  tips           String?
  transportTip   String?     @map("transport_tip")
  guideDay       GuideDay    @relation(fields: [guideDayId], references: [id])
  attraction     Attraction? @relation(fields: [attractionId], references: [id])
  createdAt      DateTime    @default(now()) @map("created_at")
  updatedAt      DateTime    @updatedAt @map("updated_at")

  @@map("guide_items")
}
```

- [ ] **Step 2: 执行数据库迁移**

```bash
cd /c/Users/张鋆宇/Documents/travel-platform && npx prisma db push
```

Expected: `Your database is now in sync with your schema.`

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add transportTip field to GuideItem model"
```

---

### Task 2: API 路由接受 transportTip

**Files:**
- Modify: `src/app/api/guides/route.ts:57`

- [ ] **Step 1: 在 POST body 解析中增加 transportTip**

在 `src/app/api/guides/route.ts` 第 57 行，`tips: item.tips || null,` 之后添加一行：

```typescript
transportTip: item.transportTip || null,
```

修改后的 items create 片段：
```typescript
items: {
  create: day.items.map((item: any) => ({
    timeSlot: item.timeSlot,
    attractionId: item.attractionId || null,
    customSpot: item.customSpot || null,
    durationMin: item.durationMin,
    ticketReminder: item.ticketReminder || null,
    tips: item.tips || null,
    transportTip: item.transportTip || null,
  })),
},
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/guides/route.ts
git commit -m "feat: accept transportTip in guide creation API"
```

---

### Task 3: GuideWizard 保存时提取 transportTip

**Files:**
- Modify: `src/components/guides/GuideWizard.tsx:117`

- [ ] **Step 1: 解析 AI JSON 时提取 transportTip**

在 `src/components/guides/GuideWizard.tsx` 第 117 行，`tips: i.tip || "",` 之后添加：

```typescript
transportTip: i.transportTip || "",
```

修改后的 items map 片段：
```typescript
items: (d.items || []).map((i: any) => ({
  timeSlot: i.time || "",
  customSpot: i.spot || "",
  durationMin: i.duration || 60,
  ticketReminder: i.ticket ? `${i.ticket.price}元 — ${i.ticket.purchase}` : "",
  tips: i.tip || "",
  transportTip: i.transportTip || "",
})),
```

- [ ] **Step 2: Commit**

```bash
git add src/components/guides/GuideWizard.tsx
git commit -m "feat: extract transportTip from AI response when saving guide"
```

---

### Task 4: GuideDetail 展示交通信息

**Files:**
- Modify: `src/components/guides/GuideDetail.tsx`

- [ ] **Step 1: 更新 TypeScript 接口**

在 `GuideDetail.tsx` 第 24-29 行的 `days.items` 类型定义中，添加 `transportTip`：

```typescript
days: {
  id: number; dayNumber: number; title: string; notes: string | null;
  items: {
    id: number; timeSlot: string; durationMin: number;
    customSpot: string | null; ticketReminder: string | null; tips: string | null;
    transportTip: string | null;
    attraction: { id: number; name: string; category: string } | null;
  }[];
}[];
```

- [ ] **Step 2: 在 tips 行之后渲染交通信息**

在 `GuideDetail.tsx` 第 163 行（`tips` 渲染的 `)` 闭合后），插入交通信息渲染：

```tsx
{item.transportTip && (
  <div style={{ fontSize: 13, color: "#059669", marginTop: 4 }}>
    🚇 {item.transportTip}
  </div>
)}
```

修改后的 items 渲染片段（第 154-166 行区域）：
```tsx
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
{item.transportTip && (
  <div style={{ fontSize: 13, color: "#059669", marginTop: 4 }}>
    🚇 {item.transportTip}
  </div>
)}
```

用绿色（#059669）区分交通信息与普通提示，视觉上一目了然。

- [ ] **Step 3: 验证 — 启动 dev server 测试**

```bash
cd /c/Users/张鋆宇/Documents/travel-platform && npm run dev
```

1. 打开 `http://localhost:3000/guide/new`，输入目的地生成一个攻略
2. 生成后跳转到攻略详情页，确认景点下方出现绿色的 🚇 交通信息行

- [ ] **Step 4: Commit**

```bash
git add src/components/guides/GuideDetail.tsx
git commit -m "feat: display transportTip in guide detail view"
```

---

### 验证清单

全部任务完成后：
- [ ] 通过 `/guide/new` 生成新攻略，确认交通信息保存并展示
- [ ] 检查旧攻略（无 transportTip）不会崩溃，正常运行
