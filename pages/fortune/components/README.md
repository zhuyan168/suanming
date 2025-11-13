# 每日运势抽牌组件说明

## 📁 文件结构

```
pages/fortune/
├── daily.tsx                    # 主页面（已重构）
└── components/
    ├── CardItem.tsx             # 单张卡牌组件
    ├── CardStrip.tsx            # 78张卡牌横向滚动容器
    ├── ScrollBar.tsx            # 自定义滚动条
    └── SelectedCardSlot.tsx    # 选中卡牌展示区域
```

## 🎯 组件功能

### CardItem.tsx
- **功能**：单张塔罗牌展示
- **特性**：
  - Hover 效果（上浮 + 阴影）
  - 点击事件处理
  - 选中状态高亮（紫色边框 + 光晕）
  - 统一的卡背设计（月亮和星星图案）
  - 响应式尺寸（移动端自适应）

### CardStrip.tsx
- **功能**：78张卡牌横向滚动容器
- **特性**：
  - Flex 横向布局
  - 隐藏浏览器默认滚动条
  - 与 ScrollBar 组件双向同步
  - 防止滚动循环更新

### ScrollBar.tsx
- **功能**：自定义滚动条（range input）
- **特性**：
  - 深色 + 紫色发光风格
  - 与 CardStrip 双向同步
  - 自定义滑块样式（紫色渐变）
  - 支持禁用状态

### SelectedCardSlot.tsx
- **功能**：选中卡牌展示区域
- **特性**：
  - 完整的抽牌动画序列：
    1. 从上方进入并上浮（0.3秒）
    2. 移动到目标位置并落地弹跳（0.8秒）
    3. 翻牌效果（卡背 → 卡面，0.8秒）
  - 支持正位/逆位显示
  - 空状态提示

## 🎬 抽牌动画流程

1. **点击卡牌** → 卡牌在原位置上浮并放大
2. **第一阶段（0.3秒）** → 卡牌从上方进入 selected-card-slot，上浮并放大
3. **第二阶段（0.8秒）** → 卡牌移动到目标位置，落地时轻微弹跳
4. **第三阶段（0.8秒）** → 执行翻牌动画（卡背 → 卡面）
5. **完成** → 调用 API 获取运势解读

## 🎨 设计规范

- **主色调**：紫色 `#7f13ec`
- **卡背样式**：深紫色渐变 + 月亮星星图案
- **动画时长**：总计约 1.9 秒
- **响应式**：支持移动端、平板、桌面

## 🔧 技术实现

- **React + TypeScript**
- **Framer Motion**：动画库
- **Tailwind CSS**：样式框架
- **模块化设计**：组件独立，易于维护

## 📝 使用示例

```tsx
import CardStrip from './components/CardStrip';
import ScrollBar from './components/ScrollBar';
import SelectedCardSlot from './components/SelectedCardSlot';

// 在 daily.tsx 中使用
<CardStrip
  cards={tarotCards}
  onCardClick={handleCardClick}
  isDisabled={isLoading}
  selectedCardIndex={selectedCardIndex}
  scrollValue={scrollValue}
  onScrollChange={setScrollValue}
/>

<ScrollBar
  value={scrollValue}
  onChange={setScrollValue}
  disabled={isLoading}
/>

<SelectedCardSlot
  selectedCard={selectedCard}
  isAnimating={isAnimating}
  orientation={cardOrientation}
/>
```

