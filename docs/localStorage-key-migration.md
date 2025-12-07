# localStorage Key 迁移完成报告

## 🎯 目标
彻底弃用旧版 localStorage key，仅使用新版 key 体系。

## ✅ 完成的工作

### 1. 移除旧 Key 相关逻辑

已完全移除以下旧 key 的读取和恢复逻辑：
- ❌ `tarotMonthlyResult` (三张牌月度运势旧key)
- ❌ `tarotMonthlyMemberResult` (七张牌月度运势旧key)

### 2. 新版 Key 体系

现在仅使用以下 key：
- ✅ `monthly_basic_YYYY-MM` (三张牌月度运势)
- ✅ `monthly_member_YYYY-MM` (七张牌会员月运)

### 3. 数据格式确保

两个新版 key 的存储结构：

#### Basic (3张牌)
```json
{
  "userId": null,
  "month": "YYYY-MM",
  "cards": [
    {
      "id": 0,
      "name": "卡牌名称",
      "image": "图片URL",
      "upright": "正位含义",
      "reversed": "逆位含义",
      "keywords": ["关键词"],
      "orientation": "upright" | "reversed"
    }
  ],
  "result": { ... },
  "createdAt": 1234567890
}
```

#### Member (7张牌)
```json
{
  "userId": null,
  "month": "YYYY-MM",
  "cards": [
    {
      "id": 0,
      "name": "卡牌名称",
      "image": "图片URL",
      "upright": "正位含义",
      "reversed": "逆位含义",
      "keywords": ["关键词"],
      "orientation": "upright" | "reversed"
    }
  ],
  "result": { ... },
  "createdAt": 1234567890
}
```

### 4. 统一的存取函数

每个模块现在都有以下标准化函数：

#### Basic (三张牌)
```typescript
// 获取key
getMonthlyBasicKey(year: number, month: number): string

// 加载数据
loadMonthlyBasicResult(year: number, month: number): MonthlyBasicResult | null

// 保存数据
saveMonthlyBasicResult(data: MonthlyBasicResult): void
```

#### Member (七张牌)
```typescript
// 获取key
getMonthlyMemberKey(year: number, month: number): string

// 加载数据
loadMonthlyMemberResult(year: number, month: number): MonthlyMemberResult | null

// 保存数据
saveMonthlyMemberResult(data: MonthlyMemberResult): void
```

### 5. 代码注释

在所有相关位置添加了清晰的注释：

```typescript
// NOTE: Old monthly fortune key deprecated.
// We no longer read or migrate `tarotMonthlyResult`.
// Only use `monthly_basic_YYYY-MM`.
```

```typescript
// NOTE: Old member monthly key deprecated.
// `tarotMonthlyMemberResult` will not be restored anymore.
// Only use `monthly_member_YYYY-MM`.
```

## 📁 修改的文件

1. ✅ `pages/fortune/monthly/basic/index.tsx`
   - 移除 `tarotMonthlyResult` 读取逻辑
   - 添加统一存取函数
   - 更新保存逻辑使用新函数

2. ✅ `pages/fortune/monthly/basic/result.tsx`
   - 移除 `tarotMonthlyResult` 恢复逻辑
   - 添加统一存取函数
   - 更新保存逻辑使用新函数

3. ✅ `pages/fortune/monthly/member/index.tsx`
   - 移除 `tarotMonthlyMemberResult` 读取逻辑
   - 添加统一存取函数
   - 更新保存逻辑使用新函数

4. ✅ `pages/fortune/monthly/member/result.tsx`
   - 移除 `tarotMonthlyMemberResult` 恢复逻辑
   - 添加统一存取函数
   - 更新保存逻辑使用新函数

## 🔍 关键改进

### 数据验证
所有保存函数现在都会确保：
- 卡牌数量正确（3张或7张）
- 每张卡都包含 `orientation` 字段
- 数据格式完整

### 单一来源原则 (SSOT)
抽牌流程简化为：
1. 用户访问页面
2. 尝试读取新版 key（当月）
3. 如果存在 → 恢复抽牌结果（含 orientation）
4. 如果不存在 → 允许用户抽牌并存入新版 key

### 旧数据处理
- ❌ 不再读取旧 key
- ❌ 不再迁移旧数据
- ❌ 不再兼容旧格式
- ✅ 旧 key 保留在 localStorage 中但不参与任何逻辑

## 🚀 后续影响

### 用户体验
- **已抽过牌的用户（新key）**：完全不受影响，继续正常使用
- **已抽过牌的用户（旧key）**：需要重新抽牌一次
- **新用户**：正常使用新系统

### 维护优势
1. 代码逻辑清晰，只有一套存储体系
2. 不再需要维护兼容逻辑
3. 数据格式统一，包含完整的 orientation 信息
4. 易于调试和追踪问题

## ⚠️ 注意事项

1. **不要清除旧 key**：旧 key 保留在 localStorage 中不会引发冲突
2. **确保 orientation**：所有新数据都必须包含 orientation 字段
3. **月份验证**：读取时验证 month 字段与当前月匹配
4. **数据长度验证**：确保 cards 数组长度正确

## 📊 Lint 检查

所有修改文件均已通过 TypeScript 和 ESLint 检查：
- ✅ `pages/fortune/monthly/basic/index.tsx`
- ✅ `pages/fortune/monthly/basic/result.tsx`
- ✅ `pages/fortune/monthly/member/index.tsx`
- ✅ `pages/fortune/monthly/member/result.tsx`

---

**完成时间**: 2025-12-07  
**执行方式**: 彻底弃用，不兼容迁移  
**状态**: ✅ 完成

