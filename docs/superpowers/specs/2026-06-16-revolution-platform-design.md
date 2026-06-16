# 红色记忆·革命教育数字平台 设计文档

## 概述

将现有 travel-platform（旅游攻略平台）深度改造为聚焦革命旧址和革命博物馆的教育平台，参加中国国际大学生创新创业大赛。

**改造策略**: 保留技术栈（Next.js 16 + React 19 + Three.js + AI），重新设计产品形态、数据模型和视觉主题。工作在 `revolution-platform` 分支上进行，master 保持原旅游平台不变。

## 用户定位

C端用户（学生/游客）进行红色旅游规划和研学教育。

## 核心差异化

1. **革命历史叙事** — 旧址关联历史事件+人物+时间线，可交互的历史教科书
2. **AI 红色讲解员** — 个性化路线生成、历史问答、语音讲解
3. **3D沉浸体验** — 旧址3D复原、虚拟展厅漫游

## 数据模型

```
Era (革命时期)
  ├── id, name, color, start_year, end_year, description
  ├── Event[]  (历史事件)
  ├── Person[] (历史人物)
  └── Route[]  (主题路线)

Province (省份) — 保留，增加 era 关联
  └── City (城市) — 保留
       └── Site (旧址/博物馆) — 原 Attraction 改造
            ├── historical_bg: String    // 历史背景
            ├── era_id: Int             // 所属时期
            ├── person_ids: Int[]       // 关联人物
            ├── event_id: Int?          // 关联事件
            ├── 3d_model_url: String?   // 3D模型
            ├── audio_url: String?      // 语音讲解
            ├── images: String[]        // 历史图片
            └── site_type: enum { 旧址, 博物馆, 纪念碑, 陵园 }

Event (历史事件)
  ├── id, name, era_id, date, location, description, significance
  └── sites: Site[], persons: Person[]

Person (历史人物)
  ├── id, name, era_id, bio, portrait_url
  └── events: Event[]

Route (主题路线)
  ├── id, name, era_id, description, days
  └── sites: Site[] (有序)
```

### 关键变化

- 删除 Continent 模型（聚焦中国）
- 删除 Country 模型（中国单国）
- Hotel 模型暂时保留（后续可以用作附近住宿推荐）
- Guide/Day/Item 模型改为 RedJourney/DayPlan/Stop

## 首页与交互

### 3D 中国地图（替代原 3D 地球）

- 中国地形底图，省份按革命时期着色
- 点击省份 → 弹出该省革命旧址列表
- 可切换三种模式：地图/时间线/路线

### 三种浏览入口

| 模式 | 描述 | 技术 |
|------|------|------|
| 地图模式 | 3D中国地图，按省份浏览 | Three.js 复用 Globe |
| 时间线模式 | 横向滑动时间轴，事件节点→旧址详情 | CSS scroll-snap + Framer Motion |
| 路线模式 | 经典红色路线，点线串联 | Leaflet/3D线条 |

### 底部导航

```
首页 | 探索 | AI讲解员 | 红色路线 | 我的
```

## AI 红色讲解员

复用现有 `/api/ai/` 路由，改写 System Prompt：

| 功能 | API | 说明 |
|------|-----|------|
| 旧址讲解 | `/api/ai/chat` | 基于旧址历史背景生成讲解 |
| 路线生成 | `/api/ai/plan` | 指定天数+区域→红色研学路线 |
| 历史问答 | `/api/ai/chat` | RAG增强，带史料引用 |
| 语音合成 | Web Speech API | 浏览器端TTS，无需服务端 |

## 3D 体验

| 功能 | 技术方案 |
|------|---------|
| 旧址3D复原 | Three.js GLTFLoader，加载手工建模/扫描模型 |
| 虚拟展厅 | Cubemap全景 + 热点标记(hotspot) |
| 3D中国地图 | 复用 RotatingGlobe 架构，改为平面或微弧中国地图 |

## 视觉主题

| 元素 | 旅游平台 | 革命平台 |
|------|---------|---------|
| 主色调 | 天蓝渐变 | 深红+暗金 (#8B0000 / #C41E3A / #D4A574) |
| 字体 | Geist | 思源宋体(标题) + 思源黑体(正文) |
| 氛围 | 明亮度假风 | 庄重温暖，历史感 |
| 图标 | 通用 | 五角星、火炬、红旗元素 |

## 保留复用的功能

- 用户系统（邮箱/手机/微信登录）— 直接保留
- AI管道（Claude/OpenAI SDK）— 保留，改Prompt
- 路线规划引擎 — 数据结构复用
- 收藏/分享/导出 — 直接保留
- 会员分级 — 保留结构，调整权益
- Tailwind响应式 — 直接保留

## 执行阶段

### Phase 1: 数据与模型（1周）
- 创建 `revolution-platform` 分支
- Prisma Schema 改造
- 手工录入20个核心旧址数据
- Migration + Seed

### Phase 2: 界面重构（2-3周）
- 首页 3D 中国地图
- 三种浏览模式
- 旧址详情页
- AI 讲解员界面
- 全局视觉主题

### Phase 3: 深度体验（1-2周）
- 3D 旧址复原
- AI 路线生成 + 历史问答
- 语音讲解
- 打卡勋章
- 打磨 + 参赛材料

## 约束

- 工作在 `revolution-platform` 分支，master 保持原旅游平台
- 数据库本地 SQLite，部署可切换 PostgreSQL
- 3D 模型先用1-2个示范，其余用实景照片
- 内容以官方史料为准，确保历史准确性
