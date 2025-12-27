# 年度运势结果页实现文档

## 概述

本文档描述了「年度运势占卜结果页」的完整实现，包括数据结构、UI 组件、解读逻辑和测试。

## 功能特性

### ✅ 已实现功能

1. **完整的类型系统**
   - `TarotCard`: 塔罗牌基础类型
   - `AnnualFortuneReading`: 年度运势抽牌结果
   - `AnnualInterpretation`: 结构化解读数据
   - `MonthInterpretation`: 月度运势解读

2. **本地规则解读生成**
   - 基于规则的解读生成，不依赖大模型
   - 支持 78 张塔罗牌（22 大阿卡纳 + 56 小阿卡纳）
   - 正逆位自动调整解读内容
   - 生成年度总运、月度运势、全年总结

3. **LLM 增强（可选）**
   - 支持 DeepSeek API 生成更个性化的解读
   - 失败时自动 fallback 到本地规则生成
   - 环境变量配置：`DEEPSEEK_API_KEY`

4. **数据存储**
   - localStorage 持久化存储
   - sessionStorage 临时存储
   - 支持多种数据获取策略（API -> sessionStorage -> localStorage）

5. **UI 组件**
   - `AnnualSpreadView`: 环形牌阵展示（13 张牌）
   - `CardDetailModal`: 牌面详情弹窗
   - `AnnualInterpretationPanel`: 解读内容面板
     - 年度总运（关键词、主线、警示）
     - 月度运势（Accordion 折叠列表）
     - 全年总结（高光月份、低潮月份、行动清单）

6. **测试系统**
   - 5 个核心测试用例
   - 测试页面：`/annual-fortune/test`
   - 自动运行并显示结果

## 文件结构

```
📁 项目根目录
├── 📁 types/
│   └── annual-fortune.ts              # 类型定义
├── 📁 utils/
│   ├── annual-interpretation.ts       # 本地规则解读生成器
│   └── annual-fortune-storage.ts      # 数据存储工具
├── 📁 pages/
│   ├── 📁 api/
│   │   └── 📁 annual-fortune/
│   │       └── interpret.ts           # LLM 解读 API
│   └── 📁 annual-fortune/
│       ├── result.tsx                 # 结果页主组件
│       └── test.tsx                   # 测试页面
├── 📁 components/fortune/
│   ├── CardDetailModal.tsx            # 牌面详情弹窗
│   ├── AnnualSpreadView.tsx           # 牌阵展示组件
│   └── AnnualInterpretationPanel.tsx  # 解读面板组件
└── 📁 tests/
    └── annual-fortune.test.ts         # 测试用例
```

## 使用指南

### 1. 访问结果页

有三种方式访问结果页：

```
方式 1: /annual-fortune/result?readingId=xxx
方式 2: /annual-fortune/result?sessionId=xxx
方式 3: /annual-fortune/result（从 sessionStorage 或 localStorage 读取）
```

### 2. 数据流程

```
抽牌页 → 保存到 sessionStorage → 跳转到结果页
                                      ↓
                           加载 reading 数据
                                      ↓
                           生成本地规则解读
                                      ↓
                           保存到 localStorage
                                      ↓
                   （可选）后台调用 LLM 升级解读
```

### 3. 空态处理

如果用户直接访问结果页但缺少数据：

- 显示友好提示："未找到抽牌记录"
- 提供「去抽牌」按钮，跳转到 `/annual-fortune`

### 4. 错误处理

- 数据加载失败：显示错误信息 + 重试按钮
- 解读生成失败：自动 fallback 到本地规则
- LLM API 失败：静默失败，不影响用户体验

## API 接口

### POST /api/annual-fortune/interpret

生成年度运势解读（支持本地规则 + LLM）

**请求体：**

```json
{
  "themeCard": {
    "id": "0",
    "name": "0. The Fool",
    "imageUrl": "https://...",
    "isReversed": false,
    "upright": "新的开始、信任直觉、勇敢冒险",
    "reversed": "冲动行事、犹豫不决、方向不明",
    "keywords": ["纯真", "自由", "机会"]
  },
  "monthCards": {
    "1": { /* TarotCard */ },
    "2": { /* TarotCard */ },
    // ... 3-12 月
  },
  "year": 2025,
  "useLLM": false  // 可选，是否使用 LLM
}
```

**响应：**

```json
{
  "success": true,
  "interpretation": {
    "yearKeywords": ["新开始", "冒险", "纯真", "信任"],
    "yearOverview": [
      "这一年充满新的可能性，勇于尝试未知领域会带来意外收获",
      "今年整体能量积极向上，抓住关键时机将获得显著进展"
    ],
    "yearWarnings": [
      "避免过度冲动，重要决定前需做好准备",
      "平衡工作与生活，避免过度消耗"
    ],
    "months": {
      "1": {
        "keywords": ["执行", "显化"],
        "focusAreas": ["事业", "财务"],
        "advice": "将想法转化为具体行动",
        "risk": "避免过度承诺或分散注意力"
      },
      // ... 2-12 月
    },
    "highlights": [3, 6, 9],  // 高光月份
    "lowlights": [2],         // 低潮月份
    "actionList": [
      "在3月把握关键机遇，主动推进重要计划",
      "2月保持耐心，做好基础工作和能量储备",
      "全年保持新开始的核心主题，定期回顾调整"
    ]
  },
  "method": "local",  // 生成方式：local / llm / llm-fallback-local
  "year": 2025
}
```

## 解读内容结构

### 年度总运

- **年度关键词**: 3-5 个词（数组展示为 tag）
- **年度主线**: 2-4 句话
- **需要注意**: 2-3 条 bullet

### 月度运势（1-12 月）

每月包含：

- **关键词**: 1-2 个 tag
- **重点领域**: 从「事业/财务/感情/人际/健康/学业/家庭」中选 1-2 个
- **一句建议**: 具体可执行的建议
- **风险提示**: 可选，逆位牌通常有此项

### 全年总结

- **高光月份**: 2-3 个月（能量积极，适合推进计划）
- **低潮月份**: 1-2 个月（需要耐心，做好储备）
- **年度行动清单**: 3 条可执行建议

## 测试

### 运行测试

访问 `/annual-fortune/test` 页面自动运行所有测试。

### 测试用例

1. **测试 1**: 缺 readingId 时空态正确
2. **测试 2**: sessionStorage fallback 工作正常
3. **测试 3**: interpretation JSON 校验失败时 fallback 生效
4. **测试 4**: 本地规则生成的完整性
5. **测试 5**: 正逆位对解读的影响

### 手动运行测试

```typescript
import { runAllTests } from '../tests/annual-fortune.test';

// 在浏览器控制台运行
runAllTests();
```

## 样式规范

- **背景色**: 暗紫色 `#191022`
- **主色调**: 紫色 `#7f13ec`
- **卡片边框**: 发光效果（正位绿色、逆位琥珀色）
- **动画**: framer-motion
  - 卡片飞入动画
  - Accordion 展开/折叠
  - 滚动淡入效果

## 环境配置

### 必需

无（本地规则生成不需要任何配置）

### 可选（LLM 增强）

在 `.env.local` 中配置：

```bash
DEEPSEEK_API_KEY=your_api_key_here
```

## 性能优化

1. **图片懒加载**: 使用 Next/Image（TODO）
2. **列表懒渲染**: Accordion 折叠默认状态
3. **数据缓存**: localStorage 持久化
4. **后台异步**: LLM 升级不阻塞 UI

## 已知限制

1. **无后端数据库**: 目前仅使用 localStorage，刷新浏览器数据仍在，但清除缓存会丢失
2. **无用户系统**: 无法跨设备同步
3. **无分享功能**: 复制链接功能已实现，但接收方无法看到数据（需要后端支持）
4. **无下载图片**: 功能按钮已占位，但未实现

## 后续优化方向

### 短期（1-2 周）

- [ ] 集成现有抽牌页数据格式（适配 `pages/fortune/annual/year-ahead/index.tsx`）
- [ ] 添加页面过渡动画
- [ ] 实现下载图片功能（Canvas / html2canvas）
- [ ] 移动端适配优化

### 中期（1-2 月）

- [ ] 添加后端数据库存储（Supabase / Firebase）
- [ ] 实现用户系统和跨设备同步
- [ ] 添加社交分享功能（生成分享卡片）
- [ ] 支持多语言（英文版）

### 长期（3-6 月）

- [ ] 月度回顾功能（对比实际情况）
- [ ] AI 对话式解读（基于 LLM）
- [ ] 个性化推荐（根据历史数据）
- [ ] 付费会员功能（深度解读、专家咨询）

## 常见问题

### Q1: 为什么要做本地规则生成？

A: 保证基础可用性。即使 LLM API 失败或未配置，用户仍能获得完整的解读体验。

### Q2: 本地规则生成的质量如何？

A: 基于塔罗牌的传统含义，结构化输出。虽然不如 LLM 个性化，但足够专业和实用。

### Q3: 如何切换到 LLM 模式？

A: 在 API 调用时设置 `useLLM: true`。页面默认使用本地规则，后台异步尝试 LLM 升级。

### Q4: 数据安全吗？

A: 目前数据仅存储在用户浏览器 localStorage 中，不上传服务器（除非启用 LLM）。

### Q5: 如何与现有抽牌页集成？

A: 需要适配现有的数据格式。现有抽牌页使用的数据结构略有不同，需要写一个转换函数。

## 集成现有抽牌页（TODO）

现有抽牌页位于 `pages/fortune/annual/year-ahead/index.tsx`，数据格式：

```typescript
// 现有格式
interface YearAheadResult {
  userId?: string | null;
  year: string;
  cards: Array<{
    id: number;
    name: string;
    image: string;
    upright: string;
    reversed: string;
    keywords: string[];
    orientation: 'upright' | 'reversed';
  }>;
  result?: any;
  createdAt: number;
}
```

需要创建转换函数：

```typescript
// utils/annual-fortune-converter.ts
export function convertYearAheadToAnnualReading(
  yearAhead: YearAheadResult
): AnnualFortuneReading {
  // 第 13 张是年度主题牌，前 12 张是月份牌
  const themeCard = convertCard(yearAhead.cards[12]);
  const monthCards: Record<number, TarotCard> = {};
  
  for (let i = 0; i < 12; i++) {
    monthCards[i + 1] = convertCard(yearAhead.cards[i]);
  }
  
  return {
    id: `year_${yearAhead.year}`,
    createdAt: new Date(yearAhead.createdAt).toISOString(),
    themeCard,
    monthCards,
    meta: {
      year: parseInt(yearAhead.year)
    }
  };
}
```

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目遵循项目主仓库的许可证。

## 联系方式

如有问题或建议，请创建 Issue。

---

**最后更新**: 2025-12-27
**版本**: 1.0.0
**状态**: ✅ 已完成核心功能，待集成现有系统

