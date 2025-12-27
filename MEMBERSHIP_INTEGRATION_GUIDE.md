# 年度运势 - 会员系统集成指南

## 当前状态

⚠️ **会员系统尚未实现**

年度运势结果页已预留会员接口位，但：
- 所有用户当前都可以访问
- 只使用本地规则生成解读（不调用 LLM）
- 不需要登录，不需要支付
- 会员相关代码全部为占位符

---

## 占位代码位置

### 1. 会员判断模块
**文件**: `utils/membership-placeholder.ts`

```typescript
// 永远返回 false
isMemberPlaceholder()

// 永远返回 null
getUserIdPlaceholder()

// 永远返回 true（允许所有人访问）
canAccessAnnualFortunePlaceholder()
```

### 2. API 接口
**文件**: `pages/api/annual-fortune/interpret.ts`

```typescript
// 第 20 行
const isMember = isMemberPlaceholder(); // 永远为 false

// 第 22-30 行：LLM 调用被会员判断包裹
if (isMember) {
  // TODO: enable when membership system is implemented
  // 永远不会执行
}
```

### 3. 前端页面
**文件**: `pages/annual-fortune/result.tsx`

```typescript
// 第 72-75 行：LLM 升级函数被禁用
const tryUpgradeWithLLM = async (...) => {
  // TODO: enable when membership system is implemented
  return; // 直接返回，不执行
}
```

---

## 未来集成步骤

### 阶段 1：实现用户系统

1. **创建用户表**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP,
  ...
);
```

2. **实现登录功能**
- 注册/登录 API
- Session 管理
- JWT Token

3. **替换占位函数**
```typescript
// utils/membership.ts
export function getUserId(): string | null {
  // 从 session/token 中获取真实用户 ID
  return session?.user?.id || null;
}
```

### 阶段 2：实现会员订阅

1. **创建订阅表**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  plan VARCHAR(50), -- 'basic' | 'premium'
  status VARCHAR(20), -- 'active' | 'expired'
  expires_at TIMESTAMP,
  ...
);
```

2. **实现支付流程**
- 接入支付网关（Stripe/微信支付等）
- 创建订单系统

3. **替换会员判断**
```typescript
// utils/membership.ts
export async function isMember(userId: string): Promise<boolean> {
  const subscription = await db.subscriptions.findOne({
    user_id: userId,
    status: 'active',
    expires_at: { $gt: new Date() }
  });
  return !!subscription;
}
```

### 阶段 3：启用 LLM 功能

1. **配置 DeepSeek API Key**
```bash
# .env.local
DEEPSEEK_API_KEY=your_real_api_key
```

2. **修改 API 接口**
```typescript
// pages/api/annual-fortune/interpret.ts

// 删除此行：
// return; // TODO: enable when membership system is implemented

// 改为真实会员检查：
const userId = await getUserId(req);
const isMember = userId ? await checkMembership(userId) : false;

if (isMember) {
  // 真正调用 LLM
  interpretation = await generateWithLLM(...);
}
```

3. **修改前端页面**
```typescript
// pages/annual-fortune/result.tsx

// 删除直接 return
// 改为真正调用：
const tryUpgradeWithLLM = async (...) => {
  try {
    const response = await fetch('/api/annual-fortune/interpret', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // 添加认证
      },
      body: JSON.stringify({ ... })
    });
    // ... 处理响应
  } catch (err) {
    // fallback
  }
};
```

### 阶段 4：添加访问控制

1. **入口页面添加会员检查**
```typescript
// pages/fortune/annual/year-ahead/index.tsx

useEffect(() => {
  const checkAccess = async () => {
    const isMember = await checkMembership();
    if (!isMember) {
      router.push('/pricing'); // 跳转到付费页面
    }
  };
  checkAccess();
}, []);
```

2. **API 添加认证中间件**
```typescript
// middleware/auth.ts
export function withAuth(handler) {
  return async (req, res) => {
    const token = req.headers.authorization;
    const user = await verifyToken(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    req.user = user;
    return handler(req, res);
  };
}

// 使用：
export default withAuth(handler);
```

---

## 会员功能清单

### 非会员（当前所有人）
- ✅ 查看年度运势结果
- ✅ 本地规则解读（基础版）
- ✅ 查看牌阵
- ✅ 点击查看单张牌详情
- ✅ 复制链接

### 会员（未来）
- ⏳ LLM 个性化解读（DeepSeek）
- ⏳ 下载高清图片
- ⏳ 社交媒体分享
- ⏳ 查看历史记录
- ⏳ 每月提醒功能
- ⏳ AI 对话式解读

---

## 需要修改的文件清单

### 必须修改（会员系统核心）
- [ ] `utils/membership-placeholder.ts` → `utils/membership.ts`
- [ ] `pages/api/annual-fortune/interpret.ts`（删除占位符，添加真实检查）
- [ ] `pages/annual-fortune/result.tsx`（启用 LLM 升级）

### 需要创建（新功能）
- [ ] `lib/auth.ts`（认证逻辑）
- [ ] `lib/db.ts`（数据库连接）
- [ ] `middleware/auth.ts`（认证中间件）
- [ ] `pages/api/auth/*`（登录/注册 API）
- [ ] `pages/api/subscriptions/*`（订阅管理 API）

### 可选修改（增强功能）
- [ ] `components/PricingTable.tsx`（付费页面）
- [ ] `components/MemberBadge.tsx`（会员标识）
- [ ] `pages/profile/subscriptions.tsx`（订阅管理页面）

---

## 测试检查清单

### 当前阶段（会员系统未实现）
- [x] 任何人都能访问结果页
- [x] 不调用 LLM（不产生费用）
- [x] 本地规则解读正常工作
- [x] 页面无"会员"相关文案
- [x] `isMemberPlaceholder()` 永远返回 `false`

### 未来阶段（会员系统实现后）
- [ ] 非会员访问入口被拦截
- [ ] 会员可以使用 LLM 解读
- [ ] LLM 失败时 fallback 到本地规则
- [ ] 会员标识正确显示
- [ ] 订阅过期后权限正确回收

---

## 费用预估（LLM 启用后）

### DeepSeek API 费用
- **输入**: ~500 tokens（13 张牌信息）
- **输出**: ~2000 tokens（结构化解读）
- **单次费用**: ~$0.002（约 ¥0.015）
- **100 个会员/年**: ~¥1.5
- **1000 个会员/年**: ~¥15

### 建议定价策略
- 年度运势功能：¥9.9/次 或 包含在会员套餐中
- LLM 成本占比：~0.15%（可忽略不计）

---

## 常见问题

### Q1: 为什么不直接实现会员系统？

A: 因为会员系统是一个复杂的独立模块，涉及：
- 用户管理
- 支付集成
- 订阅管理
- 权限控制

需要单独规划和实现，不属于「年度运势结果页」的范畴。

### Q2: 当前阶段会调用 LLM 吗？

A: **不会**。`isMemberPlaceholder()` 永远返回 `false`，LLM 代码永远不执行。

### Q3: 需要配置 API Key 吗？

A: **不需要**。当前阶段不会调用，配了也不会用。

### Q4: 如何快速测试会员功能？

A: 临时修改占位函数：
```typescript
// utils/membership-placeholder.ts
export function isMemberPlaceholder(): boolean {
  return true; // 临时改为 true 测试
}
```

然后配置真实 API Key 即可测试 LLM 调用。

**记得测试完改回 `false`！**

---

## 联系方式

如需实现完整会员系统，请参考：
- Stripe 支付集成文档
- NextAuth.js 认证文档
- Supabase 订阅管理示例

---

**最后更新**: 2025-12-27
**状态**: ⏳ 会员接口已预留，等待系统实现

