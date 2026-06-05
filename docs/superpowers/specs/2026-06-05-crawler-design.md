# 景区和酒店爬虫系统

Date: 2026-06-05 | Status: Approved

## Problem

当前景区数据是手工硬编码的 seed 数据（几十个景点，几个城市），图片来源是 Unsplash/Picsum 代理。没有酒店数据。需要从真实旅游平台爬取数据扩充数据库。

## Solution

一键批量爬虫脚本，多源（携程/马蜂窝/去哪儿）爬取 15-20 个国内热门旅游城市的景区和酒店数据，去重合并后写入数据库。

## Architecture

```
scripts/crawl/
├── index.ts              # 入口，遍历城市列表
├── sources/
│   ├── base.ts           # 公共基类：限速、重试、UA 轮换
│   ├── ctrip.ts          # 携程适配器
│   ├── mafengwo.ts       # 马蜂窝适配器
│   └── qunar.ts          # 去哪儿适配器
├── pipeline/
│   ├── normalizer.ts     # 统一字段格式
│   └── merger.ts         # 按名称+坐标去重合并
└── utils/
    └── fetcher.ts        # HTTP 客户端 (cheerio + axios)
```

## Data Model Changes

### Attraction 新增字段

- `images` String @default("[]") — 真实图片 URL 数组（替换原来的空数组）
- `source` String? — 数据来源标记 "ctrip,mafengwo"
- `openHours` String? @map("open_hours") — 开放时间
- `ratingCount` Int? @map("rating_count") — 评分数

### Hotel 新模型

```prisma
model Hotel {
  id        Int      @id @default(autoincrement())
  cityId    Int      @map("city_id")
  name      String
  lat       Float
  lng       Float
  price     Int?
  rating    Float?
  starLevel Int?     @map("star_level")
  images    String   @default("[]")
  amenities String   @default("[]")
  address   String?
  phone     String?
  source    String?
  city      City     @relation(fields: [cityId], references: [id])
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("hotels")
}
```

## Crawl Strategy

### Per City

| Step | Target | Method |
|------|--------|--------|
| 1. Search attractions | Top 15-20 attractions | City listing page → parse HTML → detail pages |
| 2. Search hotels | Top 20 hotels | Stratified: 5★/4★/3★ each ~6-7 |

### Anti-scraping

- Random delay 2-5s between requests
- User-Agent pool rotation (5-8 real UAs)
- Max 200 requests/day per source
- Retry 3x with exponential backoff

### Merge Strategy

- Match by name + coordinates (error < 500m)
- Images: deduplicate across sources
- Rating: weighted avg (Ctrip 0.4 + Mafengwo 0.4 + Qunar 0.2)
- Ticket info: Ctrip > Mafengwo > Qunar
- Description: longest wins (Mafengwo usually most detailed)

### Image Strategy

Store URLs only (no download). Existing `/api/images` proxy serves them. Avoids local storage bloat.

### Cities (Phase 1)

北京、上海、成都、杭州、西安、重庆、广州、深圳、南京、武汉、长沙、厦门、三亚、丽江、苏州、青岛、大连、昆明、桂林、哈尔滨

### Run

```bash
npx tsx scripts/crawl/index.ts              # all cities
npx tsx scripts/crawl/index.ts --city 北京   # single city
```

## Dependencies

- `cheerio` — HTML parsing
- `axios` — HTTP client (already in project via Prisma)
- `p-limit` — concurrency control

## Out of Scope

- Real-time crawling during AI guide generation
- Web admin panel for crawl management
- Hotel booking integration
- Image file download/storage
