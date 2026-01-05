# 「对方在想什么」牌阵解读功能 - 实现文档

## ✅ 完成状态

所有功能已实现并测试通过：
- ✅ 后端 API 调用 DeepSeek
- ✅ 前端解读页完整 UI
- ✅ 数据对接正常
- ✅ Build 通过无错误

---

## 📦 核心文件

### 1. 类型定义
**文件**: `types/spread-reading.ts`

```typescript
export interface SpreadCard {
  id: string;
  name: string;
  cnName?: string;
  upright: boolean;
  imageUrl?: string;
  keywords?: string[];
}

export interface SpreadReading {
  title: string;
  overall: string;
  positions: Array<{
    position: number;
    label: string;
    reading: string;
  }>;
  shortTerm: {
    trend: string;
    advice: string[];
    watchFor: string[];
  };
  disclaimer: string;
}
```

### 2. 后端 API
**文件**: `pages/api/what-they-think-reading.js`

**路由**: `POST /api/what-they-think-reading`

**请求体**:
```json
{
  "cards": [/* 6 张 SpreadCard */],
  "locale": "zh"
}
```

**响应**:
```json
{
  "ok": true,
  "reading": {/* SpreadReading 对象 */}
}
```

**特性**:
- ✅ 调用 DeepSeek Chat API
- ✅ 30 秒超时控制
- ✅ JSON 解析错误自动修复
- ✅ 校验 6 张牌
- ✅ 温柔、不油腻的解读风格
- ✅ 避免绝对预言和 PUA 话术

### 3. 抽牌页
**文件**: `pages/themed-readings/love/what-they-think/draw.tsx`

**路由**: `/themed-readings/love/what-they-think/draw`

**功能**:
- 78 张塔罗牌随机洗牌
- 用户选择 6 张牌（含正逆位）
- 2x3 牌阵展示
- 保存到 `localStorage` (key: `what_they_think_result`)
- 完成后跳转到解读页

### 4. 解读页
**文件**: `pages/themed-readings/love/what-they-think/result.tsx`

**路由**: `/themed-readings/love/what-they-think/result`

**功能**:
- 从 `localStorage` 读取抽牌结果
- 自动调用 API 生成解读
- 缓存解读到 `localStorage` (key: `what_they_think_reading`)
- 完整 UI 展示：
  - 标题 + 副标题
  - 6 张牌展示（2x3 布局）
  - 总览
  - 6 个位置逐段解读
  - 短期走向 + 建议 + 观察点
  - 温柔免责声明
- Loading 状态："正在整理 TA 的矛盾与真实想法…"
- 错误处理 + 重试按钮

---

## 🎴 牌阵固定结构（6 张）

| 位置 | 标签 | 含义 |
|------|------|------|
| 1 | TA 对你说出口的态度 | TA 目前对你表达出来的想法与立场 |
| 2 | TA 内心真正的想法 | TA 心里正在反复思考的真实念头 |
| 3 | TA 内心深处的真实感受 | TA 潜意识中的情绪与真实感受 |
| 4 | TA 对你的实际行动 | TA 在现实中对你采取的行为与反应 |
| 5 | 正在影响 TA 的外在因素 | 来自现实或他人的外部影响因素 |
| 6 | 这段关系的短期走向 | 接下来 2-3 个月内最可能的发展趋势 |

---

## 🎨 UI 设计要点

### 视觉风格
- 背景色: `#191022` (深紫黑)
- 主色调: `#7f13ec` (紫色)
- 渐变装饰: 紫色柔光球体
- 卡片: 半透明白色背景 + 边框

### 布局
- 响应式设计（移动端友好）
- 顶部导航：返回 | 标题 | 重置
- 牌阵：2 行 3 列
- 解读内容：最大宽度 5xl，居中
- 操作按钮：底部固定

### 动画
- Framer Motion
- 淡入淡出
- 逐段延迟加载（营造节奏感）

---

## 📝 Prompt 设计核心

### System Prompt
```
你是一个擅长塔罗情绪解读的占卜师，但你不会做绝对预言。
你会温柔、具体、可执行地回应用户的焦虑；
不使用夸张承诺；会提醒现实边界。
```

### 写作要求（重点）
1. **口吻**: 用"你"的口吻对用户说话（温柔但直接）
2. **避免**:
   - 肯定式承诺（如"一定会复合"）
   - PUA 式话术
   - 油腻套话
   - 绝对断言
3. **给出**:
   - 现状洞察（可能的心理/动机/矛盾点）
   - 可能性分析
   - 可执行的建议（具体、贴近现实）
4. **结构**:
   - 每个位置 1-2 段
   - Overall 1 段清晰主线
   - 短期走向 1 段总结
   - 3 条建议（短句）
   - 3 个观察点（例如：TA 是否主动联系、回应速度）
   - 1 句温柔免责声明

---

## 🔄 数据流

```
用户抽牌 (draw.tsx)
    ↓
保存到 localStorage (what_they_think_result)
    ↓
跳转到解读页 (result.tsx)
    ↓
从 localStorage 读取
    ↓
调用 API (POST /api/what-they-think-reading)
    ↓
DeepSeek 生成解读
    ↓
缓存到 localStorage (what_they_think_reading)
    ↓
展示完整解读 UI
```

---

## 🧪 测试点

### 正常流程
1. ✅ 进入抽牌页 → 洗牌成功
2. ✅ 选择 6 张牌 → 牌阵正确展示
3. ✅ 点击"查看解读" → 跳转到解读页
4. ✅ 自动生成解读 → Loading 状态正确
5. ✅ 解读内容完整展示 → 所有字段正确

### 边界情况
1. ✅ 没有抽牌结果 → 重定向到抽牌页
2. ✅ API 调用失败 → 显示错误 + 重试按钮
3. ✅ JSON 解析失败 → 自动修复机制
4. ✅ 重新抽牌 → 清除旧数据

### 缓存机制
1. ✅ 第一次生成 → 调用 API
2. ✅ 刷新页面 → 使用缓存
3. ✅ 重置/重抽 → 清除所有缓存

---

## 🚀 使用方式

### 启动开发服务器
```bash
npm run dev
```

### 访问页面
```
http://localhost:3000/themed-readings/love/what-they-think/draw
```

### 环境变量
确保 `.env.local` 中有:
```
DEEPSEEK_API_KEY=your_api_key_here
```

---

## 📋 API 成本估算

- 每次解读约 4000 tokens 输出
- DeepSeek 价格: ~$0.14 / 1M tokens (输出)
- 单次解读成本: **~$0.0006** (非常便宜)

---

## 🎯 设计哲学

这个功能的核心不是"算命"，而是**情绪陪伴**：

1. **认真对待焦虑**: 不敷衍、不套话
2. **提供可执行建议**: 不是"顺其自然"，而是"你可以这样做"
3. **温柔边界提醒**: 不是"一定会怎样"，而是"可能的方向"
4. **赋能而非依赖**: 帮助用户看清现状，而非代替 TA 做决定

---

## ✨ 完成时间

2025-01-05 完成实现

**状态**: ✅ 可立即使用

