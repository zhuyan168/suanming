# 图标显示问题修复说明

## 问题描述

在爱情主题页面中，Material Symbols 图标显示为文字（如 "arrow_back"、"info"、"lock"），而不是显示为图标。

## 问题原因

新创建的页面缺少 Material Symbols 字体的引入。首页有正确引入，但我们的新页面（`/themed-readings/love`）没有。

## 修复方案

在所有主题占卜页面的 `<Head>` 中添加 Material Symbols 字体引入：

```tsx
<Head>
  <title>...</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
  />
</Head>
```

## 已修复的文件

- ✅ `pages/themed-readings/love/index.tsx` - 爱情主题页面
- ✅ `pages/themed-readings/love/[spreadId].tsx` - 牌阵详情页（所有 Head 实例）

## 验证方法

1. 刷新页面（强制刷新：Ctrl+F5 / Cmd+Shift+R）
2. 检查以下图标是否正确显示：
   - ⬅️ 返回箭头（arrow_back）
   - ℹ️ 信息图标（info）
   - 🔒 锁图标（lock）
   - ⭐ 装饰星星（auto_awesome）
   - 🃏 卡牌图标（style）

## 图标使用示例

在组件中使用 Material Symbols 图标的正确方式：

```tsx
// ✅ 正确
<span className="material-symbols-outlined">arrow_back</span>

// ✅ 正确（带样式）
<span className="material-symbols-outlined text-xl text-primary">favorite</span>

// ❌ 错误（缺少字体引入）
// 会显示为 "arrow_back" 文字而不是图标
```

## 后续注意事项

当创建新页面时，请确保在 `<Head>` 中包含以下内容：

1. **Material Symbols 字体**（用于图标）
   ```tsx
   <link
     rel="stylesheet"
     href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
   />
   ```

2. **字体预连接**（可选，用于性能优化）
   ```tsx
   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
   ```

## 替代方案（可选）

如果希望避免在每个页面重复引入，可以考虑：

### 方案1: 使用 `_document.tsx`
在 `pages/_document.tsx` 中全局引入（如果项目有此文件）：

```tsx
// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

### 方案2: 使用 `_app.tsx`
如果有 `pages/_app.tsx`，可以在那里用 `<Head>` 全局引入。

## 已验证

- ✅ 无 Linter 错误
- ✅ 无 TypeScript 错误
- ✅ 字体 CDN 链接有效
- ✅ 所有页面都已添加引入

---

**修复时间**: 2025-12-28  
**状态**: ✅ 已完成

