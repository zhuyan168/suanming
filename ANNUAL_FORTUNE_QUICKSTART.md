# 年度运势结果页 - 快速开始

## ✅ 已完成功能

1. **完整的年度运势结果页** (`/annual-fortune/result`)
   - 环形牌阵展示（13 张牌）
   - 结构化解读内容（年度总运 + 月度运势 + 全年总结）
   - 牌面详情弹窗（点击查看单张牌）

2. **本地规则解读生成**
   - 不依赖大模型，100% 可用
   - 支持 78 张塔罗牌
   - 正逆位自动调整

3. **LLM 增强（可选）**
   - 支持 DeepSeek API
   - 失败自动 fallback

4. **数据存储**
   - localStorage 持久化
   - sessionStorage 临时存储
   - 多种数据源支持

5. **完整测试系统**
   - 5 个核心测试用例
   - 测试页面 `/annual-fortune/test`

## 🚀 快速体验

### 方式 1：快速测试（推荐）

1. 访问：`http://localhost:3000/annual-fortune`
2. 点击「生成测试数据」
3. 自动跳转到结果页

### 方式 2：完整流程

1. 访问现有抽牌页：`/fortune/annual/year-ahead`
2. 抽取 13 张牌
3. 点击「查看运势」

### 方式 3：直接访问结果页

访问：`http://localhost:3000/annual-fortune/result`

- 如果有保存的数据，直接显示
- 如果没有，显示空态并提示去抽牌

## 📁 文件清单

### 核心文件

```
types/annual-fortune.ts                    # 类型定义
utils/annual-interpretation.ts             # 本地规则生成
utils/annual-fortune-storage.ts            # 数据存储
utils/annual-fortune-converter.ts          # 格式转换

pages/api/annual-fortune/interpret.ts      # API 接口
pages/annual-fortune/result.tsx            # 结果页
pages/annual-fortune/index.tsx             # 入口页（测试用）
pages/annual-fortune/test.tsx              # 测试页

components/fortune/CardDetailModal.tsx              # 牌面弹窗
components/fortune/AnnualSpreadView.tsx             # 牌阵展示
components/fortune/AnnualInterpretationPanel.tsx    # 解读面板

tests/annual-fortune.test.ts               # 测试用例
```

### 文档

```
ANNUAL_FORTUNE_IMPLEMENTATION.md           # 详细实现文档
ANNUAL_FORTUNE_QUICKSTART.md              # 快速开始（本文档）
```

## 🧪 运行测试

访问：`http://localhost:3000/annual-fortune/test`

测试内容：
- ✅ 缺 readingId 时空态正确
- ✅ sessionStorage fallback 工作正常
- ✅ interpretation JSON 校验失败时 fallback 生效
- ✅ 本地规则生成的完整性
- ✅ 正逆位对解读的影响

## 📊 解读内容结构

### 年度总运
- **年度关键词**: 3-5 个词
- **年度主线**: 2-4 句话
- **需要注意**: 2-3 条提示

### 月度运势（可折叠）
每月包含：
- 关键词（1-2 个）
- 重点领域（事业/财务/感情/人际/健康/学业/家庭）
- 一句建议
- 风险提示（可选）

### 全年总结
- 高光月份（2-3 个月）
- 低潮月份（1-2 个月）
- 年度行动清单（3 条）

## 🎨 UI 特点

- **环形牌阵**: 12 月份牌环绕中心年度主题牌
- **点击交互**: 点击任意牌查看详情
- **Accordion**: 月度运势折叠列表，点击展开
- **响应式**: 移动端自适应
- **动画**: framer-motion 流畅动画

## 🔧 配置（可选）

### 启用 LLM 解读

在 `.env.local` 中配置：

```bash
DEEPSEEK_API_KEY=your_api_key_here
```

**注意**：不配置也能正常使用（本地规则生成）

## 🔗 与现有系统集成

现有抽牌页：`pages/fortune/annual/year-ahead/index.tsx`

### 方式 1：修改跳转链接

找到「查看运势」按钮，修改跳转路径：

```tsx
// 原代码（跳转到旧结果页）
router.push('/fortune/annual/year-ahead/result');

// 改为（跳转到新结果页）
router.push('/annual-fortune/result');
```

### 方式 2：使用转换器

如果需要保留现有数据格式，使用转换器：

```typescript
import { loadAndConvertFromLocalStorage } from '../utils/annual-fortune-converter';

// 加载并自动转换
const reading = loadAndConvertFromLocalStorage();
```

## 📝 API 使用

### 生成解读

```typescript
const response = await fetch('/api/annual-fortune/interpret', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    themeCard: { /* TarotCard */ },
    monthCards: { /* Record<number, TarotCard> */ },
    year: 2025,
    useLLM: false  // true 启用 LLM
  })
});

const data = await response.json();
// data.interpretation: AnnualInterpretation
```

## 🐛 常见问题

### Q: 页面显示"未找到抽牌记录"

A: 说明 localStorage/sessionStorage 中没有数据。
   - 方案 1：访问 `/annual-fortune` 生成测试数据
   - 方案 2：前往 `/fortune/annual/year-ahead` 完整抽牌

### Q: 解读内容是否可以自定义？

A: 可以。修改 `utils/annual-interpretation.ts` 中的规则映射表。

### Q: 如何切换到 LLM 模式？

A: 配置 `DEEPSEEK_API_KEY` 后，在 API 调用时设置 `useLLM: true`。

### Q: 数据是否会丢失？

A: localStorage 数据会持久化保存，除非用户清除浏览器缓存。
   如需跨设备同步，需要添加后端数据库。

## 🚧 后续优化（TODO）

- [ ] 添加下载图片功能
- [ ] 集成后端数据库（跨设备同步）
- [ ] 添加社交分享功能
- [ ] 支持多语言

## 📞 支持

如有问题，请查看详细文档：`ANNUAL_FORTUNE_IMPLEMENTATION.md`

---

**快速链接**：
- 入口页: `/annual-fortune`
- 结果页: `/annual-fortune/result`
- 测试页: `/annual-fortune/test`
- 现有抽牌页: `/fortune/annual/year-ahead`

**最后更新**: 2025-12-27

