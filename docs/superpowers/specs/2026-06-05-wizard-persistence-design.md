# GuideWizard 状态持久化

Date: 2026-06-05 | Status: Approved

## Problem

用户在 `/guide/new` 与 AI 对话定制攻略，切换到其他页面再回来时，useState 中的聊天消息全部丢失。

## Solution

用 sessionStorage 持久化 `messages` 和 `phase`，切页面回来自动恢复，关标签页自动清除。

## Changes

### 单文件改动: `src/components/guides/GuideWizard.tsx`

1. **恢复逻辑**: useEffect 在组件挂载时从 `sessionStorage.getItem("guideWizardState")` 读取，有数据则恢复 `messages` 和 `phase`
2. **写入逻辑**: useEffect 监听 `messages` 变化，写入 sessionStorage
3. **清理逻辑**: 攻略保存成功跳转前，`sessionStorage.removeItem("guideWizardState")`

### 存储格式

```json
{ "messages": [...], "phase": "asking" }
```

### 不持久化

- `input` — 临时输入
- `loading` — 瞬时状态
- `persona` / `mode` — 有默认值

## Out of Scope

- 跨标签页持久化
- 多对话历史管理
