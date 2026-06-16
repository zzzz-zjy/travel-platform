# 红色记忆·革命教育数字平台 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 travel-platform 改造为聚焦革命旧址和革命博物馆的教育平台

**Architecture:** 保留 Next.js 16 + React 19 + Three.js + Prisma 技术栈，重构数据模型（Era→Province→City→Site），3D 中国地图替代地球，AI System Prompt 改为革命历史讲解，全局视觉改为深红+暗金主题。工作在新分支 `revolution-platform`，master 不变。

**Tech Stack:** Next.js 16 (Turbopack), React 19, Three.js (R3F/Drei), Prisma 7 + SQLite, DeepSeek API, Tailwind CSS 4, Leaflet

---

## File Structure Map

### Files to Create
- `src/components/china-map/ChinaMapScene.tsx` — 3D 中国地图（替代 GlobeScene）
- `src/components/china-map/ChinaMapCanvas.tsx` — 中国地图 Canvas 包装器
- `src/components/china-map/ProvincePicker.tsx` — 省份选择器
- `src/components/timeline/TimelineView.tsx` — 时间线浏览模式
- `src/components/sites/SiteDetail.tsx` — 旧址详情页
- `src/components/sites/SiteCard.tsx` — 旧址卡片
- `src/components/sites/SiteList.tsx` — 旧址列表
- `src/components/narrator/AINarrator.tsx` — AI 讲解员聊天组件
- `src/components/narrator/VoiceButton.tsx` — 语音合成按钮
- `src/app/site/[id]/page.tsx` — 旧址详情路由
- `src/app/timeline/page.tsx` — 时间线路由
- `src/app/routes/page.tsx` — 红色路线路由
- `src/app/narrator/page.tsx` — AI 讲解员路由
- `src/app/api/sites/route.ts` — 旧址 API
- `src/app/api/sites/[id]/route.ts` — 旧址详情 API
- `src/app/api/eras/route.ts` — 革命时期 API
- `src/lib/revolution-seed.ts` — 革命旧址种子数据（20个核心旧址）
- `public/china-outline.svg` — 中国地图轮廓

### Files to Modify
- `prisma/schema.prisma` — 新增 Era/Event/Person/Site/Route 模型
- `src/lib/claude.ts` — 改为红色讲解员 System Prompt
- `src/lib/prisma.ts` — 可能需调整单例模式
- `src/app/layout.tsx` — 改 metadata，改底部导航
- `src/app/page.tsx` — 改为 ChinaMapScene
- `src/app/globals.css` — 红色主题 CSS 变量
- `src/components/ui/Header.tsx` — 改导航标题
- `src/app/api/ai/chat/route.ts` — 改 System Prompt
- `src/app/api/ai/plan/route.ts` — 改为红色路线生成
- `src/app/login/page.tsx` — 改视觉主题
- `src/app/my/page.tsx` — 改视觉主题
- `prisma/seed.ts` — 改为红色旧址种子数据

### Files to Keep (no changes)
- `src/lib/auth.ts` — 用户系统不变
- `src/lib/auth-context.tsx` — 不变
- `src/lib/auth-utils.ts` — 不变
- `src/lib/rate-limit.ts` — 不变
- `src/lib/geo.ts` — 不变（坐标系转换仍需要）
- `src/lib/tiers.ts` — 保留会员结构
- `src/components/Providers.tsx` — 不变
- `src/app/api/auth/**` — 不变
- `src/app/api/favorites/route.ts` — 不变
- `src/components/ui/LoadingSpinner.tsx` — 不变
- `src/components/guides/ExportButton.tsx` — 保留
- `src/components/map/CountryMap.tsx` — 保留（旧址详情页仍需要地图）
- `src/components/map/CountryMapLoader.tsx` — 保留

---

## Phase 1: 数据基础与分支

### Task 1: 创建分支并搭建基础

**Files:**
- Create: `src/lib/revolution-seed.ts`
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: 创建 revolution-platform 分支**

```bash
cd /c/Users/张鋆宇/Documents/travel-platform
git checkout -b revolution-platform
```

- [ ] **Step 2: 重写 Prisma Schema**

读当前 `prisma/schema.prisma`，完整替换为以下内容：

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
}

model Era {
  id          Int       @id @default(autoincrement())
  name        String    @unique
  color       String    @default("#C41E3A")
  startYear   Int       @map("start_year")
  endYear     Int       @map("end_year")
  description String
  events      Event[]
  persons     Person[]
  routes      Route[]
  sites       Site[]
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@map("eras")
}

model Province {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  geojson   String?
  cities    City[]
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("provinces")
}

model City {
  id         Int      @id @default(autoincrement())
  provinceId Int      @map("province_id")
  name       String
  lat        Float
  lng        Float
  province   Province @relation(fields: [provinceId], references: [id])
  sites      Site[]
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@map("cities")
}

model Site {
  id            Int           @id @default(autoincrement())
  cityId        Int           @map("city_id")
  eraId         Int           @map("era_id")
  name          String
  siteType      String        @map("site_type")
  lat           Float
  lng           Float
  rating        Float         @default(4.5)
  images        String        @default("[]")
  ticketInfo    String?       @map("ticket_info")
  transportTips String?       @map("transport_tips")
  description   String?
  historicalBg  String        @map("historical_bg")
  eventId       Int?          @map("event_id")
  model3dUrl    String?       @map("model_3d_url")
  audioUrl      String?       @map("audio_url")
  openHours     String?       @map("open_hours")
  city          City          @relation(fields: [cityId], references: [id])
  era           Era           @relation(fields: [eraId], references: [id])
  event         Event?        @relation(fields: [eventId], references: [id])
  routeStops    RouteStop[]
  journeyStops  JourneyStop[]
  favorites     Favorite[]
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")

  @@map("sites")
}

model Event {
  id            Int      @id @default(autoincrement())
  eraId         Int      @map("era_id")
  name          String
  date          String
  location      String
  description   String
  significance  String
  era           Era      @relation(fields: [eraId], references: [id])
  sites         Site[]
  eventPersons  EventPerson[]
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@map("events")
}

model Person {
  id            Int           @id @default(autoincrement())
  eraId         Int           @map("era_id")
  name          String
  bio           String
  portraitUrl   String?       @map("portrait_url")
  era           Era           @relation(fields: [eraId], references: [id])
  eventPersons  EventPerson[]
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")

  @@map("persons")
}

model EventPerson {
  id       Int    @id @default(autoincrement())
  eventId  Int    @map("event_id")
  personId Int    @map("person_id")
  role     String
  event    Event  @relation(fields: [eventId], references: [id])
  person   Person @relation(fields: [personId], references: [id])

  @@unique([eventId, personId])
  @@map("event_persons")
}

model Route {
  id          Int         @id @default(autoincrement())
  eraId       Int         @map("era_id")
  name        String
  description String
  totalDays   Int         @map("total_days")
  era         Era         @relation(fields: [eraId], references: [id])
  stops       RouteStop[]
  journeys    Journey[]
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  @@map("routes")
}

model RouteStop {
  id      Int   @id @default(autoincrement())
  routeId Int   @map("route_id")
  siteId  Int   @map("site_id")
  day     Int
  order   Int
  route   Route @relation(fields: [routeId], references: [id])
  site    Site  @relation(fields: [siteId], references: [id])

  @@map("route_stops")
}

model Journey {
  id          Int           @id @default(autoincrement())
  title       String
  routeId     Int           @map("route_id")
  totalDays   Int           @map("total_days")
  budgetAmount Int          @map("budget_amount")
  transportMode String      @map("transport_mode")
  travelStyle String        @map("travel_style")
  rawJson     String?       @map("raw_json")
  isSystem    Boolean       @default(false) @map("is_system")
  creatorIp   String?       @map("creator_ip")
  userId      String?       @map("user_id")
  user        User?         @relation(fields: [userId], references: [id])
  route       Route         @relation(fields: [routeId], references: [id])
  days        JourneyDay[]
  favorites   Favorite[]
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")

  @@map("journeys")
}

model JourneyDay {
  id          Int          @id @default(autoincrement())
  journeyId   Int          @map("journey_id")
  dayNumber   Int          @map("day_number")
  title       String
  notes       String?
  journey     Journey      @relation(fields: [journeyId], references: [id])
  stops       JourneyStop[]
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  @@map("journey_days")
}

model JourneyStop {
  id          Int      @id @default(autoincrement())
  journeyDayId Int     @map("journey_day_id")
  siteId      Int?     @map("site_id")
  timeSlot    String   @map("time_slot")
  customSpot  String?  @map("custom_spot")
  durationMin Int      @map("duration_min")
  tips        String?
  transportTip String? @map("transport_tip")
  journeyDay  JourneyDay @relation(fields: [journeyDayId], references: [id])
  site        Site?    @relation(fields: [siteId], references: [id])
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("journey_stops")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime? @map("email_verified")
  phone         String?   @unique
  phoneVerified DateTime? @map("phone_verified")
  image         String?
  accounts      Account[]
  journeys      Journey[]
  favorites     Favorite[]
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

model Favorite {
  id        Int      @id @default(autoincrement())
  userId    String   @map("user_id")
  siteId    Int      @map("site_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  site      Site     @relation(fields: [siteId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at")

  @@unique([userId, siteId])
  @@map("favorites")
}

model RateLimit {
  id    Int      @id @default(autoincrement())
  ip    String
  date  DateTime
  count Int      @default(0)

  @@unique([ip, date], name: "ipDate")
  @@map("rate_limits")
}
```

- [ ] **Step 3: 写革命旧址种子数据**

创建 `src/lib/revolution-seed.ts`：

```typescript
export interface SeedSite {
  name: string;
  siteType: string;
  lat: number; lng: number;
  rating: number;
  ticketInfo: string;
  transportTips: string;
  description: string;
  historicalBg: string;
  images: string[];
}

export interface SeedCity {
  name: string;
  lat: number; lng: number;
  sites: SeedSite[];
}

export interface SeedProvince {
  cities: SeedCity[];
}

export const ERAS = [
  { name: "建党初期", color: "#8B0000", startYear: 1919, endYear: 1927, description: "五四运动到南昌起义前，党的诞生与早期革命活动" },
  { name: "土地革命", color: "#B22222", startYear: 1927, endYear: 1937, description: "南昌起义到全面抗战前，井冈山斗争与红军长征" },
  { name: "抗日战争", color: "#C41E3A", startYear: 1937, endYear: 1945, description: "全面抗战时期，敌后战场与抗日根据地" },
  { name: "解放战争", color: "#DC143C", startYear: 1945, endYear: 1949, description: "重庆谈判到新中国成立" },
];

export const REVOLUTION_SEED: Record<string, SeedProvince> = {
  "北京": {
    cities: [
      { name: "北京", lat: 39.9042, lng: 116.4074, sites: [
        {
          name: "中国共产党历史展览馆", siteType: "博物馆",
          lat: 40.0020, lng: 116.3977, rating: 4.9,
          ticketInfo: "免费，公众号预约", transportTips: "地铁8号线奥林匹克公园站B口出",
          description: "全方位展示中国共产党百年奋斗历程的国家级展览馆",
          historicalBg: "2021年建党百年之际建成开馆，是展示中国共产党历史最全面、最权威的展馆。馆藏2600余件文物实物，全景式展现了从石库门到天安门的伟大历程。",
          images: [],
        },
        {
          name: "北大红楼（北京新文化运动纪念馆）", siteType: "旧址",
          lat: 39.9219, lng: 116.4080, rating: 4.7,
          ticketInfo: "免费，凭身份证领票", transportTips: "地铁6/8号线南锣鼓巷站F口出",
          description: "五四运动策源地，中国最早传播马克思主义的地方",
          historicalBg: "1918年建成，原北京大学文科大楼。李大钊在此开设中国最早的马克思主义课程，毛泽东曾在此担任图书馆助理员。这里是五四运动的重要发源地，也是中国共产党早期北京革命活动的见证。",
          images: [],
        },
        {
          name: "中国人民抗日战争纪念馆", siteType: "博物馆",
          lat: 39.8500, lng: 116.2188, rating: 4.8,
          ticketInfo: "免费，公众号预约", transportTips: "地铁14号线大井站B口出步行15分钟",
          description: "全国唯一全面反映中国人民抗日战争历史的综合性纪念馆",
          historicalBg: "位于卢沟桥畔宛平城内，1987年建成开馆。馆藏抗日战争时期各类文物3万余件，全景展现了从九一八事变到抗战胜利的历史。每年7月7日在此举办纪念全民族抗战爆发仪式。",
          images: [],
        },
        {
          name: "香山革命纪念馆", siteType: "博物馆",
          lat: 39.9925, lng: 116.1915, rating: 4.6,
          ticketInfo: "免费，公众号预约", transportTips: "地铁西郊线香山站出步行10分钟",
          description: "中共中央进驻北平后的第一个驻地",
          historicalBg: "1949年3月，中共中央从西柏坡迁至北平香山。毛泽东在此指挥了渡江战役，筹备了中国人民政治协商会议，为新中国诞生做了最后准备。双清别墅是毛泽东居住和办公的地点。",
          images: [],
        },
      ]},
    ],
  },
  "上海": {
    cities: [
      { name: "上海", lat: 31.2304, lng: 121.4737, sites: [
        {
          name: "中共一大会址纪念馆", siteType: "旧址",
          lat: 31.2220, lng: 121.4750, rating: 4.9,
          ticketInfo: "免费，公众号预约", transportTips: "地铁1号线黄陂南路站2号口出",
          description: "中国共产党的诞生地",
          historicalBg: "1921年7月23日，中国共产党第一次全国代表大会在此召开。来自全国各地的13名代表，代表全国50多名党员，在这里宣告了中国共产党的成立。会议最后一天因法租界巡捕袭扰，转移到浙江嘉兴南湖的游船上继续举行。",
          images: [],
        },
        {
          name: "中共二大会址纪念馆", siteType: "旧址",
          lat: 31.2260, lng: 121.4610, rating: 4.5,
          ticketInfo: "免费", transportTips: "地铁2号线南京西路站1号口出",
          description: "第一部党章诞生地",
          historicalBg: "1922年7月，中共二大在此召开。制定了党的最低纲领和最高纲领，通过了第一部《中国共产党章程》，在中国革命史上首次明确地提出了彻底反帝反封建的民主革命纲领。",
          images: [],
        },
        {
          name: "龙华烈士陵园", siteType: "陵园",
          lat: 31.1775, lng: 121.4496, rating: 4.7,
          ticketInfo: "免费", transportTips: "地铁3号线龙漕路站换公交",
          description: "缅怀革命先烈的纪念圣地",
          historicalBg: "原为国民党淞沪警备司令部旧址，1927年至1937年间，数以千计的共产党人和革命志士在此被关押和杀害。包括陈延年、赵世炎、柔石等烈士，鲁迅曾写下《为了忘却的记念》悼念在此牺牲的左联五烈士。",
          images: [],
        },
      ]},
    ],
  },
  "江西": {
    cities: [
      { name: "南昌", lat: 28.6820, lng: 115.8581, sites: [
        {
          name: "南昌八一起义纪念馆", siteType: "纪念馆",
          lat: 28.6795, lng: 115.8850, rating: 4.8,
          ticketInfo: "免费，凭身份证领票", transportTips: "地铁1号线八一馆站出",
          description: "军旗升起的地方，人民军队的诞生地",
          historicalBg: "1927年8月1日，周恩来、贺龙、叶挺、朱德等在此领导了南昌起义，打响了武装反抗国民党反动派的第一枪。这是中国共产党独立领导武装斗争和创建革命军队的开始。",
          images: [],
        },
      ]},
      { name: "井冈山", lat: 26.5680, lng: 114.1800, sites: [
        {
          name: "井冈山革命博物馆", siteType: "博物馆",
          lat: 26.5610, lng: 114.1720, rating: 4.8,
          ticketInfo: "井冈山景区联票190元", transportTips: "井冈山火车站乘景区大巴至茨坪",
          description: "中国第一个农村革命根据地的全景展示",
          historicalBg: "1927年10月，毛泽东率领秋收起义部队到达井冈山，创建了中国第一个农村革命根据地。在这里形成了'农村包围城市、武装夺取政权'的革命道路。井冈山斗争历时两年四个月，为中国革命保存了星星之火。",
          images: [],
        },
        {
          name: "八角楼毛泽东旧居", siteType: "旧址",
          lat: 26.5830, lng: 114.1470, rating: 4.6,
          ticketInfo: "含景区联票", transportTips: "井冈山景区大巴至茅坪",
          description: "毛泽东写下《星星之火，可以燎原》的地方",
          historicalBg: "1927年冬至1929年秋，毛泽东在此居住和办公。在这座土砖结构的八角形小楼里，毛泽东写下了《中国的红色政权为什么能够存在？》等光辉著作，回答了'红旗到底打得多久'的疑问。",
          images: [],
        },
      ]},
      { name: "瑞金", lat: 25.8788, lng: 116.0274, sites: [
        {
          name: "瑞金中央革命根据地纪念馆", siteType: "博物馆",
          lat: 25.8870, lng: 116.0250, rating: 4.6,
          ticketInfo: "免费", transportTips: "瑞金站乘5路公交至纪念馆",
          description: "中华苏维埃共和国临时中央政府所在地",
          historicalBg: "1931年11月，中华苏维埃共和国临时中央政府在瑞金成立，毛泽东当选为主席。瑞金成为中央革命根据地的中心，被称为'红色故都'。这里是中国共产党治国理政的第一次伟大实践。",
          images: [],
        },
      ]},
    ],
  },
  "陕西": {
    cities: [
      { name: "延安", lat: 36.5855, lng: 109.4897, sites: [
        {
          name: "延安革命纪念馆", siteType: "博物馆",
          lat: 36.5915, lng: 109.4950, rating: 4.9,
          ticketInfo: "免费，凭身份证领票", transportTips: "延安站乘K1路公交至王家坪",
          description: "中国革命从延安走向全国的见证",
          historicalBg: "1935年至1948年，延安是中共中央所在地。十三年间，党中央在此领导了抗日战争和解放战争，形成了以坚定正确的政治方向、解放思想实事求是、全心全意为人民服务、自力更生艰苦奋斗为核心的延安精神。",
          images: [],
        },
        {
          name: "杨家岭革命旧址", siteType: "旧址",
          lat: 36.6000, lng: 109.4840, rating: 4.7,
          ticketInfo: "免费", transportTips: "延安市区乘1路公交至杨家岭",
          description: "中共七大召开地",
          historicalBg: "1938年至1947年，中共中央在此办公。1945年，中共七大在此召开，确立了毛泽东思想为党的指导思想。毛泽东在此发表了《在延安文艺座谈会上的讲话》，会见了美国记者斯特朗，提出了'一切反动派都是纸老虎'的著名论断。",
          images: [],
        },
        {
          name: "枣园革命旧址", siteType: "旧址",
          lat: 36.6150, lng: 109.5020, rating: 4.7,
          ticketInfo: "免费", transportTips: "延安市区乘3路公交至枣园",
          description: "毛泽东《论联合政府》诞生地",
          historicalBg: "1944年至1947年，中共中央书记处在此办公。毛泽东在此写下了《论联合政府》《为人民服务》等重要文章。1944年，中央警卫团战士张思德牺牲后，毛泽东在此发表了《为人民服务》的著名演讲。",
          images: [],
        },
      ]},
      { name: "西安", lat: 34.3416, lng: 108.9398, sites: [
        {
          name: "西安事变纪念馆（张学良公馆）", siteType: "旧址",
          lat: 34.2640, lng: 108.9685, rating: 4.5,
          ticketInfo: "免费", transportTips: "地铁4号线大差市站C口出",
          description: "西安事变发生地，改变中国历史进程的关键地点",
          historicalBg: "1936年12月12日，张学良、杨虎城在此发动西安事变，扣押蒋介石，逼蒋抗日。在中国共产党的斡旋下，事变和平解决，促成了抗日民族统一战线的形成，成为扭转时局的关键。",
          images: [],
        },
      ]},
    ],
  },
  "贵州": {
    cities: [
      { name: "遵义", lat: 27.7225, lng: 106.9268, sites: [
        {
          name: "遵义会议会址", siteType: "旧址",
          lat: 27.6932, lng: 106.9220, rating: 4.9,
          ticketInfo: "免费，凭身份证领票", transportTips: "遵义站乘1路公交至会议会址",
          description: "中国共产党历史上一个生死攸关的转折点",
          historicalBg: "1935年1月15日至17日，中共中央政治局在遵义召开扩大会议。会议结束了王明'左'倾教条主义在中共中央的统治，确立了毛泽东在红军和中共中央的领导地位，在极端危急的历史关头挽救了党、挽救了红军、挽救了中国革命。",
          images: [],
        },
      ]},
    ],
  },
  "河北": {
    cities: [
      { name: "石家庄", lat: 38.0428, lng: 114.5149, sites: [
        {
          name: "西柏坡纪念馆", siteType: "纪念馆",
          lat: 38.3170, lng: 113.9370, rating: 4.8,
          ticketInfo: "免费", transportTips: "石家庄站乘大巴至西柏坡约1.5小时",
          description: "新中国从这里走来",
          historicalBg: "1948年5月至1949年3月，中共中央在此办公。西柏坡是解放全中国的最后一个农村指挥所。在这里，党中央指挥了三大战役，召开了七届二中全会，提出了'两个务必'的著名论断。",
          images: [],
        },
      ]},
    ],
  },
  "湖南": {
    cities: [
      { name: "韶山", lat: 27.9257, lng: 112.5240, sites: [
        {
          name: "韶山毛泽东同志纪念馆", siteType: "纪念馆",
          lat: 27.9180, lng: 112.4880, rating: 4.9,
          ticketInfo: "免费，公众号预约", transportTips: "韶山南站乘旅游大巴至景区",
          description: "毛泽东同志故乡，红太阳升起的地方",
          historicalBg: "1893年12月26日，毛泽东诞生于韶山冲上屋场。这里是毛泽东同志青少年时期生活、学习和从事早期革命活动的地方。1925年，毛泽东在此创建了中国共产党最早的农村党支部之一。",
          images: [],
        },
      ]},
    ],
  },
  "浙江": {
    cities: [
      { name: "嘉兴", lat: 30.7640, lng: 120.7560, sites: [
        {
          name: "南湖革命纪念馆", siteType: "纪念馆",
          lat: 30.7580, lng: 120.7640, rating: 4.7,
          ticketInfo: "免费", transportTips: "嘉兴站乘1路公交至南湖",
          description: "中共一大召开地（转移后），红船精神诞生地",
          historicalBg: "1921年8月初，因上海会场遭法租界巡捕袭扰，中共一大代表转移到嘉兴南湖，在一艘画舫上继续举行会议。大会通过了党的纲领和工作决议案，选举了中央领导机构，庄严宣告中国共产党成立。",
          images: [],
        },
      ]},
    ],
  },
  "重庆": {
    cities: [
      { name: "重庆", lat: 29.4316, lng: 106.9123, sites: [
        {
          name: "红岩革命纪念馆", siteType: "纪念馆",
          lat: 29.5560, lng: 106.4950, rating: 4.8,
          ticketInfo: "免费", transportTips: "地铁1号线烈士墓站2B口出",
          description: "红岩精神的发源地",
          historicalBg: "抗日战争和解放战争时期，以周恩来为首的中共中央南方局在重庆红岩村办公。这里是中国共产党在国民党统治区的指挥中心，形成了伟大的红岩精神。纪念馆包括红岩村、曾家岩、桂园等革命遗址。",
          images: [],
        },
        {
          name: "歌乐山烈士陵园（渣滓洞、白公馆）", siteType: "陵园",
          lat: 29.5660, lng: 106.4370, rating: 4.7,
          ticketInfo: "免费", transportTips: "地铁1号线烈士墓站出换公交",
          description: "红岩英烈长眠之地",
          historicalBg: "渣滓洞和白公馆是国民党军统特务关押、迫害共产党人和革命志士的监狱。1949年11月27日，国民党在溃逃前夕制造了震惊中外的'一一·二七'大屠杀，江竹筠（江姐）等300多名革命者英勇就义。",
          images: [],
        },
      ]},
    ],
  },
  "甘肃": {
    cities: [
      { name: "会宁", lat: 35.6940, lng: 105.0530, sites: [
        {
          name: "红军会宁会师旧址", siteType: "旧址",
          lat: 35.6975, lng: 105.0560, rating: 4.6,
          ticketInfo: "免费", transportTips: "会宁站乘1路公交至会师旧址",
          description: "长征胜利结束的标志",
          historicalBg: "1936年10月，红一、红二、红四方面军在会宁胜利会师，标志着历时两年、行程二万五千里的红军长征胜利结束。大会师是中国革命转危为安的关键，为此后的全民族抗战保存了革命骨干力量。",
          images: [],
        },
      ]},
    ],
  },
  "辽宁": {
    cities: [
      { name: "沈阳", lat: 41.8057, lng: 123.4315, sites: [
        {
          name: "九一八历史博物馆", siteType: "博物馆",
          lat: 41.8310, lng: 123.4615, rating: 4.8,
          ticketInfo: "免费，凭身份证领票", transportTips: "地铁1号线黎明广场站换公交",
          description: "全面展示九一八事变和东北抗日斗争历史",
          historicalBg: "1931年9月18日，日本关东军悍然发动九一八事变，开始了对东北的武装侵略。中国人民由此开始了长达14年的抗日战争。博物馆以大量文物和史料记录了这段血与火的历史，警示后人勿忘国耻。",
          images: [],
        },
      ]},
    ],
  },
};
```

- [ ] **Step 4: 运行数据库迁移**

```bash
npx prisma db push --accept-data-loss
```

Expected: 成功创建新的数据库结构。

- [ ] **Step 5: 生成 Prisma Client**

```bash
npx prisma generate
```

Expected: 在 `src/generated/prisma/` 下生成新模型。

- [ ] **Step 6: 写种子脚本**

替换 `prisma/seed.ts` 内容为：

```typescript
import { PrismaClient } from "../src/generated/prisma/client";
import { ERAS, REVOLUTION_SEED } from "../src/lib/revolution-seed";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding revolutionary education platform data...");

  // Clear existing data in correct order
  await prisma.favorite.deleteMany();
  await prisma.journeyStop.deleteMany();
  await prisma.journeyDay.deleteMany();
  await prisma.journey.deleteMany();
  await prisma.routeStop.deleteMany();
  await prisma.route.deleteMany();
  await prisma.eventPerson.deleteMany();
  await prisma.event.deleteMany();
  await prisma.person.deleteMany();
  await prisma.site.deleteMany();
  await prisma.city.deleteMany();
  await prisma.province.deleteMany();
  await prisma.era.deleteMany();

  // Seed Eras
  const eraMap: Record<string, number> = {};
  for (const era of ERAS) {
    const e = await prisma.era.create({ data: era });
    eraMap[e.name] = e.id;
  }

  // Map province to era
  const provinceEraMap: Record<string, string> = {
    "北京": "抗日战争", "上海": "建党初期", "江西": "土地革命",
    "陕西": "抗日战争", "贵州": "土地革命", "河北": "解放战争",
    "湖南": "建党初期", "浙江": "建党初期", "重庆": "抗日战争",
    "甘肃": "土地革命", "辽宁": "抗日战争",
  };

  // Seed Provinces -> Cities -> Sites
  for (const [provinceName, provinceData] of Object.entries(REVOLUTION_SEED)) {
    let province = await prisma.province.findUnique({ where: { name: provinceName } });
    if (!province) {
      province = await prisma.province.create({ data: { name: provinceName } });
    }

    for (const cityData of provinceData.cities) {
      const city = await prisma.city.create({
        data: {
          name: cityData.name,
          lat: cityData.lat,
          lng: cityData.lng,
          provinceId: province.id,
        },
      });

      const eraName = provinceEraMap[provinceName] || "抗日战争";
      const eraId = eraMap[eraName];

      for (const siteData of cityData.sites) {
        await prisma.site.create({
          data: {
            cityId: city.id,
            eraId: eraId,
            name: siteData.name,
            siteType: siteData.siteType,
            lat: siteData.lat,
            lng: siteData.lng,
            rating: siteData.rating,
            ticketInfo: siteData.ticketInfo,
            transportTips: siteData.transportTips,
            description: siteData.description,
            historicalBg: siteData.historicalBg,
            images: JSON.stringify(siteData.images),
          },
        });
      }
    }
  }

  console.log("Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 7: 运行种子数据**

```bash
npx tsx prisma/seed.ts
```

Expected: 输出 "Seed complete!"，无错误。

- [ ] **Step 8: 提交**

```bash
git add -A
git commit -m "feat: add revolutionary platform data model and seed data

- Replace travel models with Era/Event/Person/Site/Route models
- Add seed data for 20 core revolutionary sites across 11 provinces
- Remove Continent/Country/Hotel/Guide models

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2: 全局视觉主题切换

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Add Tailwind CSS v4 theme**

Replace content of `src/app/globals.css`:

```css
@import "tailwindcss";

/* Revolution Platform Theme */
:root {
  --color-primary: #8B0000;
  --color-primary-light: #C41E3A;
  --color-accent: #D4A574;
  --color-bg: #FFF8F0;
  --color-text: #1a1a1a;
  --color-text-light: #5a5a5a;
  --font-heading: "Noto Serif SC", "Source Han Serif SC", serif;
  --font-body: "Noto Sans SC", "Source Han Sans SC", system-ui, sans-serif;
}

* {
  font-family: var(--font-body);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}

body {
  background: var(--color-bg);
  color: var(--color-text);
}

/* Leaflet fix */
.leaflet-default-icon-path {
  background-image: url(https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png);
}

/* Timeline scroll snap */
.timeline-scroll {
  scroll-snap-type: x mandatory;
  overflow-x: auto;
  display: flex;
}
.timeline-scroll > * {
  scroll-snap-align: center;
  flex-shrink: 0;
}
```

- [ ] **Step 2: Update layout metadata**

`src/app/layout.tsx` — change metadata and body background:

```tsx
import type { Metadata } from "next";
import Header from "@/components/ui/Header";
import Props from "@/components/Providers";
import BottomNav from "@/components/ui/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "红色记忆 — 革命旧址与博物馆数字教育平台",
  description: "通过3D中国地图探索革命旧址，AI讲解员带你深度了解革命历史",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen" style={{ background: "var(--color-bg)", color: "var(--color-text)" }}>
        <Props>
          <Header />
          <main className="pb-16">{children}</main>
          <BottomNav />
        </Props>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Create BottomNav component**

Create `src/components/ui/BottomNav.tsx`:

```tsx
"use client";

import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { path: "/", label: "首页", icon: "🏠" },
  { path: "/explore", label: "探索", icon: "🔍" },
  { path: "/narrator", label: "AI讲解员", icon: "🤖" },
  { path: "/routes", label: "红色路线", icon: "🗺️" },
  { path: "/my", label: "我的", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
      background: "white", borderTop: "1px solid #e5e7eb",
      display: "flex", justifyContent: "space-around", padding: "8px 0",
    }}>
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              background: "none", border: "none", cursor: "pointer",
              color: active ? "var(--color-primary-light)" : "#6b7280",
              fontSize: 12, gap: 4,
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontWeight: active ? 600 : 400 }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 4: Update Header component**

Replace content of `src/components/ui/Header.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-context";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40,
      background: "linear-gradient(135deg, #8B0000 0%, #C41E3A 100%)",
      color: "white", padding: "12px 20px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <Link href="/" style={{ textDecoration: "none", color: "white" }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: "var(--font-heading)" }}>
          红色记忆
        </h1>
      </Link>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {session?.user ? (
          <span style={{ fontSize: 14, opacity: 0.9 }}>{session.user.name}</span>
        ) : (
          <Link href="/login" style={{ color: "white", fontSize: 14, textDecoration: "none" }}>
            登录
          </Link>
        )}
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Verify dev server compiles**

```bash
npm run dev
```

Wait for dev server startup. Open `http://localhost:3000`. Confirm page loads with new theme, red header, bottom navigation.

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx src/components/ui/BottomNav.tsx src/components/ui/Header.tsx
git commit -m "feat: apply red revolution theme - colors, fonts, bottom nav, header

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Phase 2: 核心页面重构

### Task 3: 3D 中国地图首页

**Files:**
- Create: `src/components/china-map/ChinaMapScene.tsx`
- Create: `src/components/china-map/ChinaMapCanvas.tsx`
- Create: `src/components/china-map/ProvincePicker.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/api/sites/route.ts` (create)

- [ ] **Step 1: Create ChinaMapScene**

Create `src/components/china-map/ChinaMapScene.tsx`:

```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ChinaMapCanvas from "./ChinaMapCanvas";
import ProvincePicker from "./ProvincePicker";

export default function ChinaMapScene() {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const router = useRouter();

  const handleProvinceClick = useCallback((provinceName: string) => {
    setSelectedProvince(provinceName);
  }, []);

  const handleSelectSite = useCallback((siteId: number) => {
    router.push(`/site/${siteId}`);
  }, [router]);

  const handleClosePicker = useCallback(() => {
    setSelectedProvince(null);
  }, []);

  return (
    <div style={{ width: "100%", height: "calc(100vh - 56px - 56px)", position: "relative",
      background: "linear-gradient(180deg, #1a0a0a 0%, #3d1010 50%, #8B0000 100%)" }}>
      {/* Title overlay */}
      <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
        <div style={{
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)",
          color: "white", padding: "12px 28px", borderRadius: 9999,
          fontSize: 15, fontWeight: 500, whiteSpace: "nowrap",
          border: "1px solid rgba(212,165,116,0.3)",
        }}>
          {selectedProvince ? (
            <>
              <button onClick={handleClosePicker}
                style={{ color: "#D4A574", background: "none", border: "none", cursor: "pointer", marginRight: 8 }}>
                ← 返回
              </button>
              <span style={{ color: "#D4A574", fontWeight: "bold" }}>{selectedProvince}</span>
              <span style={{ marginLeft: 8, opacity: 0.8 }}>— 选择革命旧址</span>
            </>
          ) : (
            <span>点击地图探索革命旧址</span>
          )}
        </div>
      </div>

      <Canvas camera={{ position: [0, -0.5, 4], fov: 35 }} style={{ position: "relative", zIndex: 1 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[2, 1, 3]} intensity={0.8} />
        <Suspense fallback={null}>
          <ChinaMapCanvas onProvinceClick={handleProvinceClick} />
          {selectedProvince && (
            <ProvincePicker
              provinceName={selectedProvince}
              onSelectSite={handleSelectSite}
              onClose={handleClosePicker}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 2: Create ChinaMapCanvas**

Create `src/components/china-map/ChinaMapCanvas.tsx`:

```tsx
"use client";

import { useRef, useCallback } from "react";
import { useFrame, useLoader, ThreeEvent } from "@react-three/fiber";
import { Mesh, TextureLoader, Vector3, PlaneGeometry, DoubleSide } from "three";

interface Props {
  onProvinceClick: (provinceName: string) => void;
}

// Simplified province bounding boxes (approximate lat/lng mapped to x/y on plane)
const PROVINCES: { name: string; x: number; y: number; size: number }[] = [
  { name: "北京", x: 1.1, y: 0.8, size: 0.12 },
  { name: "上海", x: 1.3, y: -0.5, size: 0.1 },
  { name: "江西", x: 0.9, y: -1.0, size: 0.15 },
  { name: "陕西", x: 0.1, y: 0.2, size: 0.18 },
  { name: "贵州", x: 0.1, y: -1.5, size: 0.15 },
  { name: "河北", x: 1.0, y: 0.7, size: 0.15 },
  { name: "湖南", x: 0.6, y: -1.2, size: 0.15 },
  { name: "浙江", x: 1.2, y: -0.8, size: 0.12 },
  { name: "重庆", x: 0.3, y: -1.4, size: 0.13 },
  { name: "甘肃", x: -0.3, y: 0.4, size: 0.2 },
  { name: "辽宁", x: 1.2, y: 1.2, size: 0.15 },
];

export default function ChinaMapCanvas({ onProvinceClick }: Props) {
  const groupRef = useRef<any>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.03;
    }
  });

  const handleClick = useCallback((event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const point = event.point;
    const x = point.x * 2;
    const y = point.y * 2;

    let closest = PROVINCES[0];
    let minDist = Infinity;
    for (const p of PROVINCES) {
      const dist = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
      if (dist < minDist) { minDist = dist; closest = p; }
    }
    if (minDist < 0.6) {
      onProvinceClick(closest.name);
    }
  }, [onProvinceClick]);

  return (
    <group ref={groupRef}>
      {/* Flat China map plane with simplified texture */}
      <mesh rotation={[-Math.PI / 6, 0, 0]} position={[0.2, -0.1, 0]} onClick={handleClick}>
        <planeGeometry args={[4, 3.5]} />
        <meshStandardMaterial color="#1a0a0a" roughness={0.9} side={DoubleSide} />
      </mesh>
      {/* Province markers as glowing dots */}
      {PROVINCES.map((p) => (
        <mesh key={p.name} position={[p.x * 0.5, p.y * 0.45 + 0.1, 0.01]} rotation={[-Math.PI / 6, 0, 0]}>
          <sphereGeometry args={[p.size, 16, 16]} />
          <meshBasicMaterial color="#C41E3A" />
        </mesh>
      ))}
    </group>
  );
}
```

- [ ] **Step 3: Create ProvincePicker**

Create `src/components/china-map/ProvincePicker.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Html } from "@react-three/drei";

interface Site {
  id: number;
  name: string;
  siteType: string;
}

interface Props {
  provinceName: string;
  onSelectSite: (siteId: number) => void;
  onClose: () => void;
}

export default function ProvincePicker({ provinceName, onSelectSite, onClose }: Props) {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/sites?province=${encodeURIComponent(provinceName)}`)
      .then(r => r.json())
      .then(data => { setSites(data.sites || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [provinceName]);

  return (
    <Html center position={[0, 0.8, 0]}>
      <div style={{
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)",
        borderRadius: 12, padding: 16, minWidth: 240, maxWidth: 300,
        border: "1px solid rgba(212,165,116,0.3)", color: "white",
      }}>
        <h3 style={{ margin: "0 0 12px", color: "#D4A574", fontSize: 16, fontFamily: "var(--font-heading)" }}>
          {provinceName} · 革命旧址
        </h3>
        {loading ? (
          <p style={{ opacity: 0.6, fontSize: 14 }}>加载中...</p>
        ) : sites.length === 0 ? (
          <p style={{ opacity: 0.6, fontSize: 14 }}>暂无收录旧址</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sites.map((site) => (
              <button
                key={site.id}
                onClick={() => onSelectSite(site.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(196,30,58,0.2)", border: "1px solid rgba(196,30,58,0.4)",
                  borderRadius: 8, padding: "10px 12px", color: "white", cursor: "pointer",
                  textAlign: "left", fontSize: 13,
                }}
              >
                <span style={{ color: "#D4A574", fontSize: 11 }}>
                  [{site.siteType}]
                </span>
                <span>{site.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Html>
  );
}
```

- [ ] **Step 4: Update homepage**

Replace `src/app/page.tsx`:

```tsx
import ChinaMapScene from "@/components/china-map/ChinaMapScene";

export default function Home() {
  return <ChinaMapScene />;
}
```

- [ ] **Step 5: Create sites API**

Create `src/app/api/sites/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const province = request.nextUrl.searchParams.get("province");
  if (!province) {
    return Response.json({ sites: [] });
  }

  const sites = await prisma.site.findMany({
    where: {
      city: { province: { name: province } },
    },
    select: { id: true, name: true, siteType: true },
    orderBy: { rating: "desc" },
  });

  return Response.json({ sites });
}
```

- [ ] **Step 6: Verify**

Run dev server, confirm homepage shows 3D dark map with red province dots, clicking a dot opens province picker with site list.

- [ ] **Step 7: Commit**

```bash
git add src/components/china-map/ src/app/page.tsx src/app/api/sites/route.ts
git commit -m "feat: add 3D China map homepage with province picker

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 4: 旧址详情页

**Files:**
- Create: `src/app/site/[id]/page.tsx`
- Create: `src/components/sites/SiteDetail.tsx`
- Create: `src/app/api/sites/[id]/route.ts`

- [ ] **Step 1: Create site detail API**

Create `src/app/api/sites/[id]/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const site = await prisma.site.findUnique({
    where: { id: parseInt(id) },
    include: {
      era: { select: { name: true, color: true, description: true } },
      city: {
        select: {
          name: true,
          province: { select: { name: true } },
          lat: true, lng: true,
        },
      },
      event: { select: { name: true, date: true, description: true } },
    },
  });

  if (!site) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ site });
}
```

- [ ] **Step 2: Create SiteDetail component**

Create `src/components/sites/SiteDetail.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";

interface SiteData {
  id: number;
  name: string;
  siteType: string;
  lat: number; lng: number;
  rating: number;
  ticketInfo: string | null;
  transportTips: string | null;
  description: string | null;
  historicalBg: string;
  openHours: string | null;
  images: string;
  era: { name: string; color: string; description: string };
  city: {
    name: string;
    province: { name: string };
  };
  event: { name: string; date: string; description: string } | null;
}

export default function SiteDetail({ site }: { site: SiteData }) {
  const router = useRouter();
  const images: string[] = JSON.parse(site.images || "[]");

  return (
    <div style={{ maxWidth: 768, margin: "0 auto", padding: "16px" }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 13, color: "var(--color-text-light)", marginBottom: 12 }}>
        <span style={{ cursor: "pointer" }} onClick={() => router.push("/")}>首页</span>
        {" > "}
        <span>{site.city.province.name}</span>
        {" > "}
        <span>{site.city.name}</span>
        {" > "}
        <span style={{ color: "var(--color-primary-light)" }}>{site.name}</span>
      </div>

      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${site.era.color} 0%, #1a0a0a 100%)`,
        borderRadius: 12, padding: "24px 20px", marginBottom: 16,
        color: "white",
      }}>
        <div style={{
          display: "inline-block", background: "rgba(255,255,255,0.2)",
          padding: "4px 10px", borderRadius: 9999, fontSize: 12, marginBottom: 8,
        }}>
          {site.siteType}
        </div>
        <h1 style={{
          fontSize: 24, fontWeight: 700, margin: "0 0 4px",
          fontFamily: "var(--font-heading)",
        }}>
          {site.name}
        </h1>
        <p style={{ fontSize: 13, opacity: 0.8 }}>
          {site.city.province.name} · {site.city.name} · 评分 {site.rating}
        </p>
        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <span style={{
            background: "rgba(255,255,255,0.15)", padding: "3px 10px",
            borderRadius: 9999, fontSize: 12,
          }}>
            {site.era.name}
          </span>
        </div>
      </div>

      {/* Historical Background (核心区) */}
      <section style={{
        background: "white", borderRadius: 12, padding: 20, marginBottom: 16,
        border: "1px solid #f0e0d0",
      }}>
        <h2 style={{
          fontSize: 18, fontWeight: 600, marginBottom: 12,
          fontFamily: "var(--font-heading)", color: "var(--color-primary)",
          borderLeft: "4px solid var(--color-primary-light)", paddingLeft: 10,
        }}>
          历史背景
        </h2>
        <p style={{ lineHeight: 1.9, fontSize: 15, color: "#333" }}>
          {site.historicalBg}
        </p>
      </section>

      {/* Related Event */}
      {site.event && (
        <section style={{
          background: "white", borderRadius: 12, padding: 20, marginBottom: 16,
          border: "1px solid #f0e0d0",
        }}>
          <h2 style={{
            fontSize: 18, fontWeight: 600, marginBottom: 8,
            fontFamily: "var(--font-heading)", color: "var(--color-primary)",
            borderLeft: "4px solid var(--color-primary-light)", paddingLeft: 10,
          }}>
            {site.event.name}
          </h2>
          <p style={{ fontSize: 13, color: "var(--color-text-light)", marginBottom: 8 }}>
            {site.event.date}
          </p>
          <p style={{ lineHeight: 1.8, fontSize: 14, color: "#333" }}>
            {site.event.description}
          </p>
        </section>
      )}

      {/* Practical Info */}
      <section style={{
        background: "white", borderRadius: 12, padding: 20, marginBottom: 16,
        border: "1px solid #f0e0d0",
      }}>
        <h2 style={{
          fontSize: 18, fontWeight: 600, marginBottom: 12,
          fontFamily: "var(--font-heading)", color: "var(--color-primary)",
          borderLeft: "4px solid var(--color-primary-light)", paddingLeft: 10,
        }}>
          参观信息
        </h2>
        {site.ticketInfo && (
          <InfoRow label="门票" value={site.ticketInfo} />
        )}
        {site.transportTips && (
          <InfoRow label="交通" value={site.transportTips} />
        )}
        {site.openHours && (
          <InfoRow label="开放时间" value={site.openHours} />
        )}
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", marginBottom: 8, fontSize: 14 }}>
      <span style={{ color: "var(--color-text-light)", minWidth: 70 }}>{label}</span>
      <span style={{ color: "#333" }}>{value}</span>
    </div>
  );
}
```

- [ ] **Step 3: Create site detail page**

Create `src/app/site/[id]/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import SiteDetail from "@/components/sites/SiteDetail";
import { notFound } from "next/navigation";

export default async function SitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = await prisma.site.findUnique({
    where: { id: parseInt(id) },
    include: {
      era: { select: { name: true, color: true, description: true } },
      city: {
        select: {
          name: true,
          province: { select: { name: true } },
          lat: true, lng: true,
        },
      },
      event: { select: { name: true, date: true, description: true } },
    },
  });

  if (!site) notFound();

  return <SiteDetail site={site as any} />;
}
```

- [ ] **Step 4: Verify**

Run dev server. Navigate to `http://localhost:3000`. Click a province dot → click a site → confirm detail page renders with historical background, event info, and visitor information.

- [ ] **Step 5: Commit**

```bash
git add src/app/site/ src/components/sites/ src/app/api/sites/
git commit -m "feat: add revolutionary site detail page with historical narrative

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 5: 时间线浏览模式

**Files:**
- Create: `src/app/timeline/page.tsx`
- Create: `src/components/timeline/TimelineView.tsx`
- Modify: `src/app/api/eras/route.ts` (create)

- [ ] **Step 1: Create eras API**

Create `src/app/api/eras/route.ts`:

```typescript
import { prisma } from "@/lib/prisma";

export async function GET() {
  const eras = await prisma.era.findMany({
    orderBy: { startYear: "asc" },
    include: { sites: { select: { id: true, name: true, city: { select: { name: true } } } } },
  });
  return Response.json({ eras });
}
```

- [ ] **Step 2: Create TimelineView component**

Create `src/components/timeline/TimelineView.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Era {
  id: number;
  name: string;
  color: string;
  startYear: number;
  endYear: number;
  description: string;
  sites: { id: number; name: string; city: { name: string } }[];
}

export default function TimelineView() {
  const [eras, setEras] = useState<Era[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/eras").then(r => r.json()).then(d => setEras(d.eras || []));
  }, []);

  return (
    <div style={{ padding: "16px", maxWidth: 768, margin: "0 auto" }}>
      <h1 style={{
        fontSize: 22, fontWeight: 700, marginBottom: 20,
        fontFamily: "var(--font-heading)", color: "var(--color-primary)",
      }}>
        革命历史时间线
      </h1>

      <div style={{ position: "relative", paddingLeft: 32 }}>
        {/* Timeline line */}
        <div style={{
          position: "absolute", left: 15, top: 0, bottom: 0,
          width: 2, background: "linear-gradient(180deg, #8B0000, #C41E3A, #DC143C, #D4A574)",
        }} />

        {eras.map((era, i) => (
          <div key={era.id} style={{ marginBottom: 32, position: "relative" }}>
            {/* Timeline dot */}
            <div style={{
              position: "absolute", left: -25, top: 18,
              width: 18, height: 18, borderRadius: "50%",
              background: era.color, border: "3px solid white",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }} />

            {/* Era header */}
            <div style={{
              background: `linear-gradient(135deg, ${era.color} 0%, #1a0a0a 100%)`,
              color: "white", borderRadius: 10, padding: "16px 20px",
              marginBottom: 12,
            }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 18, fontFamily: "var(--font-heading)" }}>
                {era.name}
              </h2>
              <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>
                {era.startYear} — {era.endYear}
              </p>
              <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.6, opacity: 0.9 }}>
                {era.description}
              </p>
            </div>

            {/* Sites in this era */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 8 }}>
              {era.sites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => router.push(`/site/${site.id}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "white", border: "1px solid #f0e0d0",
                    borderRadius: 8, padding: "10px 14px", cursor: "pointer",
                    textAlign: "left", fontSize: 14,
                  }}
                >
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: era.color, flexShrink: 0,
                  }} />
                  <span style={{ flex: 1, color: "#333" }}>{site.name}</span>
                  <span style={{ fontSize: 12, color: "var(--color-text-light)" }}>
                    {site.city.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create timeline page**

Create `src/app/timeline/page.tsx`:

```tsx
import TimelineView from "@/components/timeline/TimelineView";

export default function TimelinePage() {
  return <TimelineView />;
}
```

- [ ] **Step 4: Verify**

Run dev server. Navigate to `http://localhost:3000/timeline`. Confirm vertical timeline shows 4 eras, each with associated sites, clicking a site navigates to detail.

- [ ] **Step 5: Commit**

```bash
git add src/app/timeline/ src/components/timeline/ src/app/api/eras/
git commit -m "feat: add timeline browsing mode with eras and sites

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 6: AI 红色讲解员

**Files:**
- Modify: `src/lib/claude.ts`
- Modify: `src/app/api/ai/chat/route.ts`
- Create: `src/app/narrator/page.tsx`
- Create: `src/components/narrator/AINarrator.tsx`
- Create: `src/components/narrator/VoiceButton.tsx`

- [ ] **Step 1: Rewrite AI System Prompt**

Replace `src/lib/claude.ts` — change `SYSTEM_PROMPT` to:

```typescript
const REVOLUTION_SYSTEM_PROMPT = `你是"红色记忆"平台的AI革命历史讲解员。你的职责是：

1. 为革命旧址和博物馆提供专业、准确的历史讲解
2. 生成红色研学路线
3. 回答革命历史相关问题

## 讲解要求
- 内容以权威党史资料为准，确保历史准确性
- 语言庄重但不枯燥，适合大学生群体
- 每个旧址讲解包含：历史背景 → 重要事件 → 历史意义 → 参观建议
- 引用具体人物、时间、地点，增强可信度

## 路线规划
- 按地理位置合理安排，避免折返
- 每天安排2-3个核心旧址，留出参观和思考时间
- 包含交通建议和门票信息
- 适合研学旅行节奏

输出格式为纯 JSON，不要用 markdown 代码块。`;
```

Update the function to use the new prompt and also rename the export:

```typescript
export async function generatePlan(params: PlanParams): Promise<ReadableStream> {
  // ... keep same implementation but use REVOLUTION_SYSTEM_PROMPT
```

Keep the full `generatePlan` function body from the original file, just replace `SYSTEM_PROMPT` reference with `REVOLUTION_SYSTEM_PROMPT`.

- [ ] **Step 2: Rewrite Chat API System Prompt**

Replace `src/app/api/ai/chat/route.ts` System Prompt:

```typescript
const systemPrompt = `你是"红色记忆"平台的AI革命历史讲解员。以下是用户正在浏览的革命旧址信息：

${guideContext}

用户会向你提出关于这个旧址的问题，请基于史料提供准确、专业的回答。
如果用户问的问题超出你的知识范围，如实告知，不要编造。
回答风格：专业但不枯燥，适合大学生理解。`;
```

- [ ] **Step 3: Create AI Narrator component**

Create `src/components/narrator/AINarrator.tsx`:

```tsx
"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AINarrator() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "你好！我是红色记忆AI讲解员。你可以问我关于任何革命旧址、历史事件或人物的问题，比如：\n\n• 遵义会议为什么是转折点？\n• 帮我规划一个延安3日研学路线\n• 介绍井冈山革命根据地的历史",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          guideContext: "革命旧址教育平台，上下文为用户正在浏览革命旧址相关内容",
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value);
          const lines = text.split("\n").filter(l => l.startsWith("data: "));
          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                fullResponse += data.text;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: fullResponse };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "抱歉，出现了一些问题，请重试。" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px - 56px)" }}>
      {/* Chat header */}
      <div style={{
        background: "linear-gradient(135deg, #8B0000, #C41E3A)",
        color: "white", padding: "16px 20px", textAlign: "center",
      }}>
        <h1 style={{ margin: 0, fontSize: 18, fontFamily: "var(--font-heading)" }}>
          AI 红色讲解员
        </h1>
      </div>

      {/* Messages */}
      <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            marginBottom: 12,
            display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
          }}>
            <div style={{
              maxWidth: "85%", padding: "12px 16px", borderRadius: 12,
              background: msg.role === "user" ? "var(--color-primary-light)" : "white",
              color: msg.role === "user" ? "white" : "#333",
              border: msg.role === "assistant" ? "1px solid #f0e0d0" : "none",
              fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap",
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ textAlign: "center", color: "var(--color-text-light)", fontSize: 13 }}>
            思考中...
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: 12, borderTop: "1px solid #eee", background: "white" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="输入你的问题..."
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 9999,
              border: "1px solid #e0d0c0", fontSize: 14, outline: "none",
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{
              padding: "10px 20px", borderRadius: 9999,
              background: loading ? "#ccc" : "var(--color-primary-light)",
              color: "white", border: "none", cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14,
            }}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create narrator page**

Create `src/app/narrator/page.tsx`:

```tsx
import AINarrator from "@/components/narrator/AINarrator";

export default function NarratorPage() {
  return <AINarrator />;
}
```

- [ ] **Step 5: Verify**

Run dev server. Navigate to `http://localhost:3000/narrator`. Type a test question "介绍遵义会议" and confirm AI responds with historical content.

- [ ] **Step 6: Commit**

```bash
git add src/lib/claude.ts src/app/api/ai/chat/route.ts src/app/narrator/ src/components/narrator/
git commit -m "feat: add AI revolutionary narrator with custom system prompt

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 7: 红色路线浏览

**Files:**
- Create: `src/app/routes/page.tsx`
- Create: `src/app/api/routes/route.ts`
- Create: `src/components/routes/RouteList.tsx`

- [ ] **Step 1: Create routes API**

Create `src/app/api/routes/route.ts`:

```typescript
import { prisma } from "@/lib/prisma";

export async function GET() {
  const routes = await prisma.route.findMany({
    include: {
      era: { select: { name: true, color: true } },
      stops: {
        orderBy: [{ day: "asc" }, { order: "asc" }],
        include: {
          site: {
            select: { id: true, name: true, siteType: true, city: { select: { name: true } } },
          },
        },
      },
    },
  });

  return Response.json({ routes });
}
```

- [ ] **Step 2: Create routes page**

Create `src/app/routes/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface RouteData {
  id: number;
  name: string;
  description: string;
  totalDays: number;
  era: { name: string; color: string };
  stops: {
    day: number;
    order: number;
    site: { id: number; name: string; siteType: string; city: { name: string } };
  }[];
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/routes").then(r => r.json()).then(d => setRoutes(d.routes || []));
  }, []);

  const stopsByDay = (route: RouteData) => {
    const map: Record<number, RouteData["stops"]> = {};
    route.stops.forEach(s => {
      if (!map[s.day]) map[s.day] = [];
      map[s.day].push(s);
    });
    return Object.entries(map).sort(([a], [b]) => parseInt(a) - parseInt(b));
  };

  if (routes.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "var(--color-text-light)" }}>
        <p>路线数据收集中，敬请期待</p>
        <p style={{ fontSize: 14 }}>
          — 将覆盖长征路、延安行、井冈山研学等经典红色路线 —
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px", maxWidth: 768, margin: "0 auto" }}>
      <h1 style={{
        fontSize: 22, fontWeight: 700, marginBottom: 20,
        fontFamily: "var(--font-heading)", color: "var(--color-primary)",
      }}>
        红色路线
      </h1>

      {routes.map(route => (
        <div key={route.id} style={{
          background: "white", borderRadius: 12, marginBottom: 16,
          border: "1px solid #f0e0d0", overflow: "hidden",
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${route.era.color} 0%, #1a0a0a 100%)`,
            color: "white", padding: "16px 20px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 17, fontFamily: "var(--font-heading)" }}>
                {route.name}
              </h2>
              <span style={{
                background: "rgba(255,255,255,0.2)", padding: "3px 10px",
                borderRadius: 9999, fontSize: 11,
              }}>
                {route.era.name} · {route.totalDays}天
              </span>
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 13, opacity: 0.9 }}>
              {route.description}
            </p>
          </div>

          <div style={{ padding: 16 }}>
            {stopsByDay(route).map(([day, stops]) => (
              <div key={day} style={{ marginBottom: 12 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: "var(--color-primary)",
                  marginBottom: 6,
                }}>
                  第{day}天 ({stops.length}个旧址)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {stops.map(stop => (
                    <button
                      key={stop.site.id}
                      onClick={() => router.push(`/site/${stop.site.id}`)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: "#FFF8F0", border: "1px solid #f0e0d0",
                        borderRadius: 8, padding: "8px 12px", cursor: "pointer",
                        textAlign: "left", fontSize: 13,
                      }}
                    >
                      <span style={{ color: "var(--color-primary-light)", fontSize: 11 }}>
                        [{stop.site.siteType}]
                      </span>
                      <span style={{ flex: 1 }}>{stop.site.name}</span>
                      <span style={{ color: "var(--color-text-light)", fontSize: 12 }}>
                        {stop.site.city.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run dev server. Navigate to `http://localhost:3000/routes`. Confirm placeholder message shows ("路线数据收集中..."), or if routes were seeded, see route cards.

- [ ] **Step 4: Commit**

```bash
git add src/app/routes/ src/app/api/routes/
git commit -m "feat: add red routes browsing page with day-by-day stops

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Phase 3: 整理与完善

### Task 8: 清理旧路由 & 连接导航

**Files:**
- Modify: `src/app/explore/page.tsx` (add explore page)
- Modify: `src/app/my/page.tsx` (update theme)

- [ ] **Step 1: Create simple explore page**

Create `src/app/explore/page.tsx`:

```tsx
import Link from "next/link";

export default function ExplorePage() {
  return (
    <div style={{ padding: 24, maxWidth: 768, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, fontFamily: "var(--font-heading)", color: "var(--color-primary)" }}>
        探索革命旧址
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Link href="/timeline" style={{ textDecoration: "none" }}>
          <div style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid #f0e0d0", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
            <div style={{ fontWeight: 600, color: "var(--color-primary)" }}>时间线浏览</div>
            <div style={{ fontSize: 13, color: "var(--color-text-light)", marginTop: 4 }}>按历史时期探索</div>
          </div>
        </Link>
        <Link href="/routes" style={{ textDecoration: "none" }}>
          <div style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid #f0e0d0", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🗺️</div>
            <div style={{ fontWeight: 600, color: "var(--color-primary)" }}>红色路线</div>
            <div style={{ fontSize: 13, color: "var(--color-text-light)", marginTop: 4 }}>经典研学路线</div>
          </div>
        </Link>
        <Link href="/narrator" style={{ textDecoration: "none" }}>
          <div style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid #f0e0d0", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
            <div style={{ fontWeight: 600, color: "var(--color-primary)" }}>AI讲解员</div>
            <div style={{ fontSize: 13, color: "var(--color-text-light)", marginTop: 4 }}>智能历史问答</div>
          </div>
        </Link>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid #f0e0d0", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🗺️</div>
            <div style={{ fontWeight: 600, color: "var(--color-primary)" }}>地图探索</div>
            <div style={{ fontSize: 13, color: "var(--color-text-light)", marginTop: 4 }}>3D中国地图</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update my page theme**

Read `src/app/my/page.tsx`. If existing ticket/login references look broken (old Guide model references), simplify to a placeholder:

```tsx
export default function MyPage() {
  return (
    <div style={{ padding: 24, textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, fontFamily: "var(--font-heading)", color: "var(--color-primary)" }}>
        我的
      </h1>
      <div style={{ background: "white", borderRadius: 12, padding: 32, border: "1px solid #f0e0d0" }}>
        <p style={{ color: "var(--color-text-light)" }}>登录后可查看收藏的旧址和研学路线</p>
        <a href="/login" style={{ color: "var(--color-primary-light)" }}>去登录 →</a>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Full app smoke test**

```bash
npm run dev
```

Navigate through all pages:
- `/` — 3D China map loads, province dots visible
- `/explore` — shows 4 navigation cards
- `/timeline` — shows eras with sites
- `/routes` — shows placeholder or routes
- `/narrator` — AI chat interface loads, can type and get response
- `/site/1` — shows site detail
- `/my` — shows placeholder login page

- [ ] **Step 4: Commit**

```bash
git add src/app/explore/ src/app/my/
git commit -m "feat: add explore landing page and update my page theme

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 9: 最终检查与文档

- [ ] **Step 1: Verify master is untouched**

```bash
git checkout master
git log --oneline -3
```

Expected: master shows the original travel-platform commits, no revolution platform changes.

```bash
git checkout revolution-platform
```

- [ ] **Step 2: Final dev server test**

```bash
npm run dev
```

Do a complete walkthrough: Home → click province → site detail → timeline → routes → narrator → explore → my.

- [ ] **Step 3: Commit any remaining changes**

```bash
git add -A
git commit -m "chore: final cleanup and polish for revolution platform MVP

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

- [ ] **Step 4: Check diff from master**

```bash
git diff master --stat
```

Expected: Shows all created/modified files, no master-side changes.

---

## Completion Criteria

- [x] `revolution-platform` branch exists, master unchanged
- [x] New data model: Era, Event, Person, Site, Route with Prisma migration run
- [x] 20 core revolutionary sites seeded across 11 provinces
- [x] 3D China map homepage with province picker
- [x] Site detail page with historical background, event info, visitor info
- [x] Timeline browsing mode
- [x] AI narrator with revolution-focused system prompt
- [x] Red routes page
- [x] Explore landing page
- [x] Red theme: colors, fonts, header, bottom nav
- [x] All pages navigable end-to-end
- [x] Dev server compiles and runs cleanly
