# /plan 旧址研学规划页 — 设计规格

## 目标

仿原旅游平台交互式地图规划体验，为青途智红平台新增 `/plan` 页面，让用户在地图上浏览、筛选、选择旧址/博物馆加入行程，最后生成AI研学路线。

## 布局

```
┌──────────────────────────────────┬──────────────┐
│          🗺️ 地图区域              │  研学偏好     │
│  红色五星标记23个旧址+博物馆       │  场景模式/人数 │
│  点击标记 → 弹出详情卡片           │  天数/预算等   │
│  卡片含"加入行程"按钮              │              │
├──────────────────────────────────┴──────────────┤
│ 📍 已选 N 个旧址    [清空]    [✨ 生成研学路线]  │
└──────────────────────────────────────────────────┘
```

## 技术方案

### 页面路由
- `src/app/plan/page.tsx` — 服务端组件，预加载sites数据
- `src/components/plan/PlanMap.tsx` — 客户端组件，Leaflet地图
- `src/components/plan/PlanPanel.tsx` — 右侧偏好面板
- `src/components/plan/SiteCard.tsx` — 地图标记弹出卡片
- `src/components/plan/SelectionBar.tsx` — 底部已选栏

### 数据流
1. 服务端从Prisma加载所有sites（含city/province/era）
2. PlanMap渲染Leaflet地图 + 红色五星标记
3. 点击标记 → SiteCard popup → "加入行程" toggle
4. 已选状态存客户端useState，也写sessionStorage防刷新丢失
5. 点"生成研学路线" → router.push(`/journey/new?sites=${ids}`)
6. `/journey/new` 已有支持sites参数的能力（已验证）

### 偏好筛选
- 场景模式：深度研学 / 主题路线 / 精华速览（透传给journey/new的mode）
- 计划天数：1-7天
- 人均预算：预设档位
- 省份筛选：按province分组
- 时期筛选：按era（建党初期/长征/抗战/解放战争）

筛选仅影响地图标记显示/隐藏，不重新请求数据。

### 主题适配
- 标记点：红色五星 ★（替代蓝色水滴）
- 主色：#8B0000 / #C41E3A
- 面板背景：米白 #FDF8F0
- 已加入按钮：红色实心底
- 生成按钮：红金渐变

### 数据库
无需改动。现有Site/Era/Province模型已覆盖所需字段。

### API
无需新增。现有 `/api/sites` 已可用。选中状态纯客户端管理。
