# Transport Tip: 交通信息保存与展示

Date: 2026-06-05 | Status: Approved

## Problem

AI 已在生成 `transportTip`（含地铁线路/站名/时间/费用），但保存和展示两个环节都丢弃了它：
- DB `GuideItem` 表无此字段
- `GuideWizard` 保存时未提取该字段
- `GuideDetail` 展示时不渲染交通信息

## Scope

仅处理交通信息字符串的 **存储 + 展示**。不改 AI prompt，不引入结构化交通数据。

## Changes

### 1. Prisma Schema

`GuideItem` 新增非必填字符串字段：

```prisma
transportTip String? @map("transport_tip")
```

### 2. Guides API (`/api/guides/route.ts`)

POST body 的每个 item 接受 `transportTip` 字段，透传给 Prisma create。

### 3. GuideWizard (`src/components/guides/GuideWizard.tsx`)

保存解析 JSON 时提取 `i.transportTip || ""`，传入 items 数组。

### 4. GuideDetail (`src/components/guides/GuideDetail.tsx`)

每个 GuideItem 下方，`tips` 行之后，渲染交通信息行：

```
🚇 {transportTip}
```

展示逻辑：
- 仅在 `transportTip` 非空时渲染
- 样式与 tips/ticket 行一致（小号灰色文字）
- 第一个景点（如 09:00 出发）通常无前序交通，不展示

### Files Touched

| File | Change |
|------|--------|
| `prisma/schema.prisma` | +1 字段 |
| `src/app/api/guides/route.ts` | +1 行：POST item create 加 transportTip |
| `src/components/guides/GuideWizard.tsx` | +1 行：解析 transportTip |
| `src/components/guides/GuideDetail.tsx` | +5 行：渲染交通行 |

## Out of Scope

- AI prompt 修改（已生成 transportTip，无需改动）
- 结构化交通数据（type/line/station/cost 拆分）
- 酒店爬虫
- 出发日期/出发地定制
- 页面状态持久化
