# 百度搜索聚合爬虫

Date: 2026-06-05 | Status: Approved

## Problem

携程/马蜂窝/去哪儿爬虫因 Cloudflare 反爬全部失败（HTTP 432/404）。

## Solution

改用百度搜索聚合。搜索 "城市+热门景点推荐" 和 "城市+酒店推荐"，从搜索结果摘要和百度百科卡片提取数据。

## Changes

### 新增: `scripts/crawl/sources/baidu.ts`

BaiduCrawler 实现 BaseCrawler 接口：
- `searchAttractions(city)`: 搜索 "{city} 热门景点推荐"，解析搜索结果卡片
- `searchHotels(city)`: 搜索 "{city} 酒店推荐"，解析搜索结果

### 修改: `scripts/crawl/index.ts`

crawlers 数组改为 `[new BaiduCrawler()]`

### 保留不变

- `base.ts` — 接口不变
- `fetcher.ts` — HTTP 层不变
- `normalizer.ts` / `merger.ts` — 管道不变
- `ctrip.ts` / `mafengwo.ts` / `qunar.ts` — 文件保留但不引用

## Out of Scope

- Google 搜索
- Puppeteer/Playwright
