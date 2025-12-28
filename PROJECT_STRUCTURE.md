# 主题占卜项目结构

## 📁 完整文件树

```
suanming/
│
├── 📁 config/                          # 配置文件
│   └── 📄 themedReadings.ts            # ⭐ 主题占卜配置（核心数据源）
│       ├── SpreadConfig                # 牌阵配置接口
│       ├── ThemeConfig                 # 主题配置接口
│       ├── LOVE_SPREADS[]              # 爱情主题 6 个牌阵
│       ├── THEMED_READINGS_CONFIG{}    # 全部主题配置
│       ├── getThemeConfig()            # 获取主题配置
│       └── getSpreadConfig()           # 获取牌阵配置
│
├── 📁 hooks/                           # React Hooks
│   └── 📄 useMembership.ts             # ⭐ 会员状态 Hook
│       └── useMembership()             # 返回 { isMember, membershipTier, ... }
│
├── 📁 components/                      # 组件
│   ├── 📁 fortune/                     # 现有占卜组件（未修改）
│   │   ├── AnnualSpreadView.tsx
│   │   ├── CardItem.tsx
│   │   └── ...
│   │
│   └── 📁 themed-readings/             # ⭐ 主题占卜组件（新增）
│       ├── 📄 ThemeHeader.tsx          # 主题页面头部
│       │   └── ThemeHeader             # 标题 + 副标题 + 返回按钮
│       │
│       ├── 📄 SpreadCard.tsx           # 牌阵卡片
│       │   └── SpreadCard              # 单个牌阵展示 + 交互
│       │
│       ├── 📄 SpreadsGrid.tsx          # 网格布局
│       │   └── SpreadsGrid             # 响应式网格容器
│       │
│       ├── 📄 PaywallBadge.tsx         # 付费锁标识
│       │   └── PaywallBadge            # "Members Only" 角标
│       │
│       └── 📄 UnlockModal.tsx          # 会员弹窗
│           └── UnlockModal             # 付费提示弹窗
│
├── 📁 pages/                           # 页面
│   ├── 📁 fortune/                     # 现有占卜页面（未修改）
│   │   ├── daily.tsx
│   │   ├── monthly/
│   │   ├── seasonal/
│   │   └── annual/
│   │
│   ├── 📁 themed-readings/             # ⭐ 主题占卜页面（新增）
│   │   └── 📁 love/                    # 爱情主题
│   │       ├── 📄 index.tsx            # 爱情主题页面
│   │       │   └── LoveThemePage       # 展示 6 个牌阵
│   │       │
│   │       └── 📄 [spreadId].tsx       # 牌阵详情页
│   │           └── SpreadDetailPage    # 占位页面
│   │
│   └── 📄 index.js                     # ⭐ 首页（已修改）
│       └── 爱情按钮 → /themed-readings/love
│
└── 📁 docs/                            # 文档（新增）
    ├── 📄 THEMED_READINGS_LOVE_V1.md   # 功能实现文档
    ├── 📄 TESTING_GUIDE.md             # 测试指南
    ├── 📄 IMPLEMENTATION_SUMMARY.md    # 实现总结
    └── 📄 PROJECT_STRUCTURE.md         # 项目结构（本文件）
```

## 🔄 数据流

```
┌─────────────────────────────────────────────────────────────┐
│                         首页 (index.js)                      │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         主题占卜 Themed Readings                     │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │ 爱情 ✅  │  │ 事业 🔜 │  │ 财富 🔜 │          │   │
│  │  └────┬─────┘  └──────────┘  └──────────┘          │   │
│  └───────┼──────────────────────────────────────────────┘   │
└──────────┼──────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│              爱情主题页 (/themed-readings/love)              │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │   免费牌阵 (2)   │  │   付费牌阵 (4)   │                │
│  ├──────────────────┤  ├──────────────────┤                │
│  │ 感情现状 🔓     │  │ 关系走向 🔒     │                │
│  │ 对方想法 🔓     │  │ 复合可能 🔒     │                │
│  │                  │  │ 深层连接 🔒     │                │
│  │                  │  │ 行动建议 🔒     │                │
│  └────┬────┬────────┘  └────┬────────────┘                │
└───────┼────┼──────────────────┼───────────────────────────┘
        │    │                  │
        ▼    ▼                  ▼
    ┌────────────┐      ┌─────────────┐
    │ 详情页     │      │ 会员弹窗    │
    │ (占位)     │      │ UnlockModal │
    └────────────┘      └─────────────┘
```

## 📋 组件依赖关系

```
LoveThemePage (pages/themed-readings/love/index.tsx)
├── useMembership()                 # 获取会员状态
├── getThemeConfig('love')          # 获取主题配置
├── <ThemeHeader />                 # 页面头部
├── <SpreadsGrid>                   # 网格布局
│   └── <SpreadCard /> × 6          # 6 个牌阵卡片
│       └── <PaywallBadge />        # 付费锁（条件渲染）
└── <UnlockModal />                 # 会员弹窗（条件渲染）

SpreadDetailPage (pages/themed-readings/love/[spreadId].tsx)
├── getSpreadConfig('love', id)     # 获取牌阵配置
├── useMembership()                 # 验证访问权限
└── <ThemeHeader />                 # 页面头部
```

## 🎨 样式系统

```
主题配色
├── bg-[#0f0f23]           # 主背景（深色）
├── bg-white/5             # 卡片背景（半透明）
├── text-primary           # 主题色（紫色）
├── text-white             # 主文字
├── text-white/60          # 副文字
└── border-white/10        # 边框

动画效果
├── hover:scale-[1.02]     # Hover 放大
├── animate-pulse-glow     # 发光效果
├── animate-fade-in        # 淡入动画
└── animate-scale-in       # 缩放动画

响应式断点
├── sm: 640px
├── md: 768px              # 2 列
├── lg: 1024px             # 3 列
└── xl: 1280px
```

## 🔑 关键接口

### SpreadConfig（牌阵配置）
```typescript
{
  id: string;              // 例: "love-relationship-snapshot"
  titleZh: string;         // 例: "感情现状"
  titleEn: string;         // 例: "Relationship Snapshot"
  descZh: string;          // 描述（中文）
  descEn: string;          // 描述（英文）
  cardsCount: number;      // 牌数: 3-6
  isPaid: boolean;         // 是否付费
  icon?: string;           // 图标: emoji
  badge?: string;          // 标签: "Most Popular"
}
```

### ThemeConfig（主题配置）
```typescript
{
  id: 'love' | 'career' | 'wealth';
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  icon: string;            // Material Icon name
  spreads: SpreadConfig[]; // 牌阵列表
}
```

### MembershipStatus（会员状态）
```typescript
{
  isMember: boolean;       // 当前固定为 false
  membershipTier?: 'basic' | 'premium' | 'vip';
  expiresAt?: Date;
  features?: string[];
}
```

## 🎯 路由映射

```
路径                                          → 页面组件
──────────────────────────────────────────────────────────────
/                                             → pages/index.js
/themed-readings/love                         → pages/themed-readings/love/index.tsx
/themed-readings/love/love-relationship-snapshot → pages/themed-readings/love/[spreadId].tsx
/themed-readings/love/love-their-feelings     → pages/themed-readings/love/[spreadId].tsx
/themed-readings/love/love-relationship-outcome → pages/themed-readings/love/[spreadId].tsx
/themed-readings/love/love-reconciliation     → pages/themed-readings/love/[spreadId].tsx
/themed-readings/love/love-deep-connection    → pages/themed-readings/love/[spreadId].tsx
/themed-readings/love/love-action-guidance    → pages/themed-readings/love/[spreadId].tsx
```

## 🔧 配置文件详解

### config/themedReadings.ts
这是整个主题占卜系统的核心配置文件：

```typescript
// 1. 定义数据类型
export type SpreadTheme = 'love' | 'career' | 'wealth';
export interface SpreadConfig { ... }
export interface ThemeConfig { ... }

// 2. 爱情主题牌阵（6个）
export const LOVE_SPREADS: SpreadConfig[] = [
  { id: 'love-relationship-snapshot', ... },  // 免费
  { id: 'love-their-feelings', ... },         // 免费
  { id: 'love-relationship-outcome', ... },   // 付费
  { id: 'love-reconciliation', ... },         // 付费
  { id: 'love-deep-connection', ... },        // 付费
  { id: 'love-action-guidance', ... },        // 付费
];

// 3. 全部主题配置
export const THEMED_READINGS_CONFIG = {
  love: {
    id: 'love',
    titleZh: '爱情',
    titleEn: 'Love',
    spreads: LOVE_SPREADS,
  },
  career: { spreads: [] }, // 预留
  wealth: { spreads: [] }, // 预留
};

// 4. 工具函数
export function getThemeConfig(theme) { ... }
export function getSpreadConfig(theme, spreadId) { ... }
```

## 🚀 扩展新主题的步骤

### 1️⃣ 定义牌阵配置
在 `config/themedReadings.ts` 中添加：
```typescript
export const CAREER_SPREADS: SpreadConfig[] = [
  {
    id: 'career-current-status',
    titleZh: '职场现状',
    titleEn: 'Career Status',
    cardsCount: 3,
    isPaid: false,
  },
  // ... 更多牌阵
];
```

### 2️⃣ 更新主题配置
```typescript
career: {
  id: 'career',
  titleZh: '事业 & 学业',
  titleEn: 'Career & Study',
  spreads: CAREER_SPREADS,
},
```

### 3️⃣ 创建页面文件
```
pages/themed-readings/career/
├── index.tsx          # 复制 love/index.tsx，改主题名
└── [spreadId].tsx     # 复制 love/[spreadId].tsx
```

### 4️⃣ 修改首页按钮
```typescript
onClick={() => router.push('/themed-readings/career')}
```

## 📊 代码复用率

| 组件/文件 | 是否可复用 | 复用方式 |
|-----------|-----------|----------|
| ThemeHeader | ✅ 100% | 传入标题即可 |
| SpreadCard | ✅ 100% | 传入配置即可 |
| SpreadsGrid | ✅ 100% | 纯布局组件 |
| PaywallBadge | ✅ 100% | 无需修改 |
| UnlockModal | ✅ 100% | 无需修改 |
| index.tsx | ✅ 95% | 改主题名（1行） |
| [spreadId].tsx | ✅ 95% | 改主题名（1行） |
| themedReadings.ts | ⚙️ 扩展 | 添加新配置 |

**结论**: 添加新主题只需 **修改/新增 < 10 行代码**！

---

**更新时间**: 2025-12-28  
**文档版本**: v1.0

