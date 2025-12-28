# 主题占卜 - 爱情主题 v1 实现文档

## 概述

本次实现完成了「Themed Readings → Love」的完整 UI 框架，包括：
- ✅ 爱情主题页面，展示 6 个牌阵（2 免费 / 4 付费）
- ✅ 牌阵详情页占位
- ✅ 会员锁与付费墙展示
- ✅ 可复用组件系统，方便后续扩展其他主题

## 文件结构

```
suanming/
├── config/
│   └── themedReadings.ts          # 主题占卜配置文件（核心数据源）
├── hooks/
│   └── useMembership.ts            # 会员状态 Hook（目前为 mock）
├── components/
│   └── themed-readings/
│       ├── ThemeHeader.tsx         # 主题页面头部组件
│       ├── SpreadCard.tsx          # 单个牌阵卡片组件
│       ├── SpreadsGrid.tsx         # 牌阵网格布局容器
│       ├── PaywallBadge.tsx        # 付费锁标识
│       └── UnlockModal.tsx         # 会员解锁弹窗
└── pages/
    └── themed-readings/
        └── love/
            ├── index.tsx           # 爱情主题页面
            └── [spreadId].tsx      # 牌阵详情页（占位）
```

## 路由

| 路由 | 说明 |
|------|------|
| `/` | 首页（已修改爱情按钮跳转） |
| `/themed-readings/love` | 爱情主题页面 |
| `/themed-readings/love/[spreadId]` | 牌阵详情页 |

## 牌阵配置

爱情主题包含 6 个牌阵：

### 免费牌阵（2 个）
1. **感情现状** (Relationship Snapshot) - 3 张牌
   - ID: `love-relationship-snapshot`
   - 标签: "Most Popular"
   
2. **对方想法** (Their Feelings Quick Read) - 3 张牌
   - ID: `love-their-feelings`

### 付费牌阵（4 个）
3. **关系走向** (Relationship Outcome) - 5 张牌
   - ID: `love-relationship-outcome`
   
4. **复合可能** (Reconciliation Potential) - 5 张牌
   - ID: `love-reconciliation`
   
5. **深层连接** (Deep Connection) - 6 张牌
   - ID: `love-deep-connection`
   
6. **行动建议** (Action Guidance) - 4 张牌
   - ID: `love-action-guidance`

## 功能特性

### 1. 会员系统 Mock
- 当前 `useMembership()` 返回 `isMember = false`
- 后续接入真实会员系统时，只需修改 `hooks/useMembership.ts`
- 预留了会员等级、过期时间等字段

### 2. 付费墙交互
- **免费牌阵**：点击直接进入详情页
- **付费牌阵（非会员）**：
  - 卡片右上角显示"Members Only"锁标识
  - 点击触发弹窗提示会员专享
  - 按钮文案为"Unlock to Read"

### 3. 组件复用性
所有组件都支持配置驱动，后续新增主题（Career/Wealth）只需：
1. 在 `config/themedReadings.ts` 中添加配置
2. 创建对应的页面文件 `pages/themed-readings/[theme]/index.tsx`
3. 修改首页按钮跳转

### 4. UI 设计风格
- 深色主题（`bg-[#0f0f23]`）
- 紫色主题色（`text-primary`）
- 发光边框效果（`animate-pulse-glow`）
- Hover 动画与缩放效果
- 统一的卡片圆角与间距

## 使用方式

### 从首页进入
1. 访问首页 `/`
2. 点击「主题占卜 Themed Readings」区域的「爱情 (Love)」按钮
3. 进入爱情主题页面

### 选择牌阵
1. 在爱情主题页面，浏览 6 个牌阵
2. **免费牌阵**：直接点击「Start Reading」进入详情页
3. **付费牌阵**：点击「Unlock to Read」查看会员提示

### 牌阵详情页（占位）
- 显示牌阵基本信息（卡数、预计时间等）
- 展示"功能开发中"提示
- 列出后续将接入的功能（抽牌动画、AI 解读等）
- 「开始占卜」按钮为禁用状态

## 后续扩展

### 1. 添加新主题（Career / Wealth）
```typescript
// 1. 在 config/themedReadings.ts 中添加牌阵配置
export const CAREER_SPREADS: SpreadConfig[] = [
  // ...定义事业主题的牌阵
];

// 2. 更新 THEMED_READINGS_CONFIG
career: {
  id: 'career',
  titleZh: '事业 & 学业',
  titleEn: 'Career & Study',
  spreads: CAREER_SPREADS,
},

// 3. 创建页面
// pages/themed-readings/career/index.tsx
// pages/themed-readings/career/[spreadId].tsx

// 4. 修改首页按钮
onClick={() => router.push('/themed-readings/career')}
```

### 2. 接入真实会员系统
修改 `hooks/useMembership.ts`：
```typescript
export function useMembership(): MembershipStatus {
  // 1. 从 localStorage/Cookie 读取 token
  const token = localStorage.getItem('authToken');
  
  // 2. 调用后端 API 验证会员状态
  const { data } = useSWR('/api/membership/status', fetcher);
  
  // 3. 返回真实数据
  return {
    isMember: data?.isMember ?? false,
    membershipTier: data?.tier,
    expiresAt: data?.expiresAt,
  };
}
```

### 3. 实现牌阵占卜功能
在 `pages/themed-readings/love/[spreadId].tsx` 中：
1. 添加抽牌交互组件
2. 接入 DeepSeek API 进行解读
3. 展示解读结果与建议
4. 保存历史记录

## 技术栈

- **框架**: Next.js (Pages Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图标**: Material Symbols (Google Icons)
- **状态管理**: React Hooks

## 注意事项

1. **不影响现有功能**：本次实现完全独立，不会影响现有的月度/季度/年度占卜模块
2. **配置驱动**：所有牌阵信息统一在 `config/themedReadings.ts` 中管理
3. **类型安全**：使用 TypeScript 确保类型正确
4. **无 Linter 错误**：所有代码已通过 linter 检查

## 测试清单

- [x] 首页爱情按钮可跳转到爱情主题页
- [x] 爱情主题页正确显示 6 个牌阵
- [x] 免费牌阵可点击进入详情页
- [x] 付费牌阵显示锁标识
- [x] 点击付费牌阵触发会员弹窗
- [x] 牌阵详情页正确显示占位信息
- [x] 返回按钮功能正常
- [x] 响应式布局（桌面 3 列，移动 1 列）
- [x] Hover 动画效果正常

## 开发时间线

- **v1.0** (当前版本)：UI 框架与路由结构
- **v1.1** (待开发)：抽牌交互与动画
- **v1.2** (待开发)：接入 DeepSeek AI 解读
- **v2.0** (待开发)：Career & Wealth 主题

---

**完成日期**: 2025-12-28  
**版本**: v1.0  
**状态**: ✅ 已完成，可交付使用

