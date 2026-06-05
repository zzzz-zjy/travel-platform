# 出发信息定制

Date: 2026-06-05 | Status: Approved

## Problem

用户在 AI 定制攻略时无法指定出发地和出发日期，导致无法获得到达交通推荐（火车/飞机），也无法按日期安排行程。

## Solution

GuideWizard 加出发地/日期选择器 → 注入 AI prompt → AI 生成交通推荐 + 日期感知行程 → 展示在攻略详情。

## Changes

### 1. Prisma Schema
Guide 表新增两个可选字段：
- `departureCity String? @map("departure_city")`
- `departureDate String? @map("departure_date")`

### 2. GuideWizard UI
聊天框上方加出发信息表单（出发地下拉 + 日期选择器）

### 3. AI Prompt
注入出发地和日期到 system prompt，要求 AI 生成到达交通推荐

### 4. API Route
POST /api/guides 接受 departureCity + departureDate

### 5. GuideDetail
攻略顶部展示到达交通信息

### Data Flow

用户选择出发地/日期 → GuideWizard state → AI prompt → AI JSON 含交通推荐 → 保存到 DB → GuideDetail 展示
