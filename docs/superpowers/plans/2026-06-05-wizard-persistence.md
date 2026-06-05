# GuideWizard 状态持久化 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 用户切换页面后回到 /guide/new 时，自动恢复之前的 AI 对话状态。

**Architecture:** 用 sessionStorage 存储 messages + phase。两个 useEffect：一个恢复，一个写入。攻略保存成功后清除。

**Tech Stack:** React 19, Next.js 16, sessionStorage API

---

### Task 1: 添加 sessionStorage 持久化

**Files:**
- Modify: `src/components/guides/GuideWizard.tsx`

- [ ] **Step 1: 添加存储 key 常量和恢复逻辑**

在组件顶部（第 18 行之后），添加 sessionStorage key：

```typescript
const STORAGE_KEY = "guideWizardState";
```

在 `initialSent` ref 之后（第 28 行之后），添加恢复 useEffect：

```typescript
// 恢复之前的对话状态
useEffect(() => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { messages: savedMsgs, phase: savedPhase } = JSON.parse(saved);
      if (savedMsgs?.length > 0) {
        setMessages(savedMsgs);
        setPhase(savedPhase || "asking");
      }
    }
  } catch {}
}, []);
```

- [ ] **Step 2: 添加保存 useEffect**

在恢复 useEffect 之后，添加写入逻辑：

```typescript
// 持久化对话状态
useEffect(() => {
  if (messages.length > 0) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, phase }));
    } catch {}
  }
}, [messages, phase]);
```

- [ ] **Step 3: 攻略保存成功后清除存储**

在 `router.push` 之前（第 123 行），添加清理：

```typescript
sessionStorage.removeItem(STORAGE_KEY);
```

修改后的跳转逻辑：
```typescript
const saved = await saveRes.json();
sessionStorage.removeItem(STORAGE_KEY);
setTimeout(() => router.push(`/guides/${saved.id}`), 1500);
```

- [ ] **Step 4: Commit**

```bash
git add src/components/guides/GuideWizard.tsx
git commit -m "feat: persist GuideWizard chat state with sessionStorage"
```

---

### 验证

- [ ] 在 `/guide/new` 输入消息与 AI 对话
- [ ] 切换到其他页面（如攻略广场），再回到 `/guide/new`，确认对话恢复
- [ ] 生成完整攻略跳转后，回到 `/guide/new`，确认是空白新对话
- [ ] 关闭标签页重新打开，确认是空白新对话
