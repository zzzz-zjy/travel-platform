# 出发信息定制 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development.

**Goal:** 用户选择出发地/日期后，AI 自动生成到达交通推荐和日期感知行程。

**Architecture:** GuideWizard 加表单 → AI prompt 注入 → DB 存储 → GuideDetail 展示。

**Tech Stack:** React 19, Next.js 16, Prisma, DeepSeek API

---

### Task 1: Prisma + API + AI Prompt

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/app/api/guides/route.ts`
- Modify: `src/app/api/ai/plan/chat/route.ts`

**Step 1: Prisma — Guide 模型加字段**

Read `prisma/schema.prisma`, find Guide model. After `travelStyle` field, add:
```prisma
departureCity  String?  @map("departure_city")
departureDate  String?  @map("departure_date")
```

Run `npx prisma db push`.

**Step 2: API route — POST /api/guides 接受新字段**

In `src/app/api/guides/route.ts` POST handler, find the guide create data block, add:
```typescript
departureCity: body.departureCity || null,
departureDate: body.departureDate || null,
```

**Step 3: AI Prompt — 注入出发信息**

In `src/app/api/ai/plan/chat/route.ts`, find the `POST` function. Add departure info extraction from the request body and inject it into the system prompt.

After `const { messages, persona, mode } = await request.json();`:
```typescript
const { departureCity, departureDate } = await request.json();
```

At the end of SYSTEM_PROMPT (before the final `);`), add:
```javascript
let departureInstruction = "";
if (departureCity && departureDate) {
  departureInstruction = `\n## 出发信息\n- 用户出发地：${departureCity}\n- 出发日期：${departureDate}\n\n在攻略开头添加"到达交通"部分，推荐高铁(含大致时间、二等座价格)和航班(含大致时间、经济舱价格)各一个方案。根据出发日期考虑季节性因素和周末/工作日人流量差异。`;
}
```

And include `departureInstruction` in the messages:
```typescript
messages: [
  { role: "system", content: SYSTEM_PROMPT + personaInstruction + modeInstruction + departureInstruction },
  ...
]
```

**Step 4: Commit**

```bash
git add prisma/schema.prisma src/app/api/guides/route.ts src/app/api/ai/plan/chat/route.ts
git commit -m "feat: add departure city/date support to AI guide generation"
```

---

### Task 2: GuideWizard UI + GuideDetail display

**Files:**
- Modify: `src/components/guides/GuideWizard.tsx`
- Modify: `src/components/guides/GuideDetail.tsx`

**Step 1: GuideWizard — 出发信息表单**

In GuideWizard.tsx:

Add state:
```typescript
const [departureCity, setDepartureCity] = useState("");
const [departureDate, setDepartureDate] = useState("");
```

Add form UI above the chat box (inside the card, before the input area). In the streamChat function, pass `departureCity` and `departureDate` to the fetch:
```typescript
body: JSON.stringify({
  messages: msgs.map((m) => ({ role: m.role, content: m.content })),
  phase,
  persona: extra?.persona || persona,
  mode: extra?.mode || mode,
  departureCity,
  departureDate,
}),
```

Add to the save payload:
```typescript
departureCity: departureCity || null,
departureDate: departureDate || null,
```

Add the UI - a compact row above the messages area:
```tsx
<div style={{ padding: "8px 16px", borderBottom: "1px solid #e5e7eb", background: "#fafafa", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
  <span style={{ fontSize: 13, color: "#6b7280" }}>从</span>
  <input placeholder="出发城市" value={departureCity} onChange={(e) => setDepartureCity(e.target.value)}
    style={{ padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, width: 110 }} />
  <span style={{ fontSize: 13, color: "#6b7280" }}>出发</span>
  <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)}
    style={{ padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13 }} />
  <span style={{ fontSize: 11, color: "#9ca3af" }}>可选，填了会推荐火车/飞机</span>
</div>
```

This goes between the header area and the messages area.

**Step 2: GuideDetail — 显示出发信息**

Read GuideDetail.tsx TypeScript interface at the top. Add to GuideWithDays:
```typescript
departureCity: string | null;
departureDate: string | null;
```

In the JSX, after the badges row (transportMode, budget, etc.), add a departure info card that only shows when both fields exist:

```tsx
{guide.departureCity && guide.departureDate && (
  <div style={{ marginTop: 16, padding: "12px 16px", background: "#f0f9ff", borderRadius: 10, border: "1px solid #bae6fd" }}>
    <span style={{ fontSize: 13, color: "#0369a1" }}>
      🚄 从 {guide.departureCity} 出发 · {guide.departureDate}
    </span>
  </div>
)}
```

**Step 3: Commit**

```bash
git add src/components/guides/GuideWizard.tsx src/components/guides/GuideDetail.tsx
git commit -m "feat: add departure city/date UI to wizard and guide detail"
```

---

### Verification

- [ ] `/guide/new` 页面出现出发地和日期输入框
- [ ] 填写出发信息后生成攻略，攻略详情显示出发信息卡片
- [ ] 不填出发信息也能正常生成攻略
