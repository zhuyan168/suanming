# 三张牌万能牌阵 - 实现文档

## 功能概述

已完成"通用牌阵 - 三张牌万能牌阵"的三个核心页面，包括问题输入、抽牌、结果展示。

## 路由结构

```
/reading/general/three-card-universal/
  ├── question.tsx  - 问题输入页
  ├── draw.tsx      - 抽牌页
  └── reveal.tsx    - 结果展示页
```

## 用户流程

1. **入口**: 首页 → 综合占卜 → 通用牌阵 → 点击"三张牌万能牌阵"卡片
2. **问题输入页** (`/question`)
   - 用户可选择输入或不输入问题
   - 最多200字，带字数计数
   - 问题保存到 `localStorage`（key: `general_three_card_question`）
   - 点击"开始抽牌"进入抽牌页
3. **抽牌页** (`/draw`)
   - 显示用户输入的问题（如果有）
   - 从78张塔罗牌中抽取3张
   - 复用现有抽牌组件 (`ThreeCardSlots`)
   - 支持正逆位随机
   - 抽满3张后自动保存并跳转到展示页
4. **结果展示页** (`/reveal`)
   - 展示3张已抽取的牌
   - 显示问题（如果有）
   - 显示每张牌的详细信息（正/逆位、关键词、含义）
   - 提供"重新抽牌"和"修改问题"按钮
   - AI解读功能显示为"敬请期待"（灰色不可用）

## LocalStorage 数据结构

### 问题存储
```typescript
key: 'general_three_card_question'
value: string  // 用户输入的问题文本
```

### 抽牌结果存储
```typescript
key: 'general_three_card_draw_result'
value: {
  timestamp: number,
  cards: Array<{
    id: number,
    name: string,
    image: string,
    upright: string,
    reversed: string,
    keywords: string[],
    orientation: 'upright' | 'reversed'
  }>,
  question?: string
}
```

## 复用的组件

- `ThreeCardSlots` - 三张牌槽位组件（包含翻牌动画）
- `CardItem` - 单张卡牌组件
- `EmptySlot` - 空槽位组件
- `ScrollBar` - 滚动条组件
- `ThemeHeader` - 主题头部组件（未使用，保持页面风格统一）

## UI/UX 特性

✅ 深色背景 (`bg-[#0f0f23]`) 与项目风格一致
✅ 紫色主题色 (`#7f13ec`) 统一
✅ 动画效果使用 `framer-motion`
✅ 响应式设计，移动端和桌面端自适应
✅ 毛玻璃效果 (`backdrop-blur`)
✅ 发光边框和阴影效果
✅ 平滑的页面过渡动画

## 验收清单

- ✅ 从"通用牌阵"点击"三张牌万能牌阵"能进入问题输入页
- ✅ 不输入问题也能正常开始抽牌
- ✅ 输入问题后，后续页面能展示该问题
- ✅ 抽牌动画与其他牌阵一致（复用 ThreeCardSlots）
- ✅ 抽满3张后自动进入展示页
- ✅ 展示页显示所有牌的详细信息
- ✅ 展示页不包含解读内容、没有结果页跳转
- ✅ 提供"重新抽牌"功能
- ✅ 数据保存到 localStorage

## 技术实现细节

### 洗牌算法
使用 Fisher-Yates 洗牌算法确保随机性

### 正逆位生成
使用 `crypto.getRandomValues()` (如果可用) 或 `Math.random()` 生成随机正逆位

### 状态管理
使用 React Hooks (useState, useEffect) 管理本地状态
使用 localStorage 持久化数据

### 路由跳转
- 问题输入页 → 抽牌页：用户点击"开始抽牌"
- 抽牌页 → 展示页：抽满3张后自动跳转（延迟1秒）
- 展示页 → 抽牌页：点击"重新抽牌"
- 展示页 → 问题输入页：点击"修改问题"

## 后续扩展建议

1. **AI解读功能**: 
   - 创建 `/reading/general/three-card-universal/reading.tsx`
   - 接入大模型 API
   - 根据用户问题和抽取的牌生成解读

2. **历史记录**:
   - 保存多次抽牌记录
   - 提供历史查看功能

3. **分享功能**:
   - 生成结果图片
   - 支持社交媒体分享

4. **牌阵变体**:
   - 提供不同的三张牌布局（如：过去-现在-未来）
   - 用户可选择牌阵含义

## 文件清单

### 新增文件
- `/pages/reading/general/three-card-universal/question.tsx` (152行)
- `/pages/reading/general/three-card-universal/draw.tsx` (371行)
- `/pages/reading/general/three-card-universal/reveal.tsx` (266行)
- `/docs/three-card-universal-implementation.md` (本文件)

### 修改文件
- `/data/spreads.tsx` - 更新 `three-card-universal` 的 href
- `/components/themed-readings/SpreadCard.tsx` - 无实质修改（已简化）

### 复用文件
- `/components/fortune/ThreeCardSlots.tsx`
- `/components/fortune/CardItem.tsx`
- `/components/fortune/EmptySlot.tsx`
- `/components/fortune/ScrollBar.tsx`

## 测试步骤

1. 启动开发服务器: `npm run dev`
2. 访问: `http://localhost:3000/reading/general`
3. 点击"三张牌万能牌阵"卡片
4. 测试流程:
   - 输入问题 → 开始抽牌 → 抽取3张 → 查看结果
   - 不输入问题 → 开始抽牌 → 抽取3张 → 查看结果
   - 重新抽牌
   - 修改问题
5. 验证数据持久化:
   - 刷新页面，检查问题和结果是否保留
   - 清除 localStorage，验证重置功能

## 注意事项

- 本版本暂未实现 AI 解读功能
- 抽牌结果仅保存最近一次（不支持历史记录）
- localStorage 数据在清除浏览器缓存时会丢失
- 所有文案使用中文
