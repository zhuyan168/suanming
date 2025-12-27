# DeepSeek API 配置指南

## 快速开始

### 1. 获取 API Key

访问：https://platform.deepseek.com/api_keys

1. 注册/登录 DeepSeek 账号
2. 创建 API Key
3. 复制 Key（以 `sk-` 开头）

### 2. 配置环境变量

复制示例文件：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`：

```bash
# 填入你的真实 API Key
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx

# 临时启用 LLM（开发测试用）
ENABLE_LLM_FOR_ALL=true
```

### 3. 重启开发服务器

```bash
npm run dev
```

### 4. 测试

访问：`http://localhost:3000/annual-fortune`

1. 点击「生成测试数据」
2. 等待跳转到结果页
3. 观察控制台输出：

```
🤖 Attempting LLM interpretation...
✅ LLM interpretation generated successfully
```

如果看到以上输出，说明 LLM 已成功调用！

---

## 环境变量说明

### `DEEPSEEK_API_KEY`

- **必需**：是（如果要使用 LLM）
- **格式**：`sk-` 开头的字符串
- **用途**：调用 DeepSeek API

### `ENABLE_LLM_FOR_ALL`

- **必需**：否
- **默认值**：`false`
- **可选值**：`true` | `false`
- **用途**：
  - `true`: 所有用户都能使用 LLM（开发测试用）
  - `false`: 只有会员能使用 LLM（生产环境）

⚠️ **重要**：正式上线前，必须设置为 `false` 或删除此配置！

---

## 费用说明

### DeepSeek 定价（2024年12月）

- **输入**：¥0.001 / 1K tokens
- **输出**：¥0.002 / 1K tokens

### 年度运势解读成本

- **输入**：~800 tokens（牌面信息 + 提示词）
- **输出**：~2500 tokens（结构化解读）
- **单次费用**：约 ¥0.006（不到 1 分钱）

### 成本估算

| 用户数 | 年度费用 | 月均费用 |
|--------|----------|----------|
| 100    | ¥0.6     | ¥0.05    |
| 1,000  | ¥6       | ¥0.5     |
| 10,000 | ¥60      | ¥5       |

💡 **结论**：成本极低，可忽略不计。

---

## 开发模式

### 模式 1：所有人使用 LLM（推荐测试用）

```bash
# .env.local
DEEPSEEK_API_KEY=sk-xxxxxxxx
ENABLE_LLM_FOR_ALL=true
```

**行为**：
- 任何人访问结果页都会调用 LLM
- 用于开发和测试
- 方便查看 LLM 生成效果

### 模式 2：只有会员使用 LLM（生产环境）

```bash
# .env.local
DEEPSEEK_API_KEY=sk-xxxxxxxx
ENABLE_LLM_FOR_ALL=false  # 或者删除这一行
```

**行为**：
- 只有 `isMemberPlaceholder()` 返回 `true` 时才调用 LLM
- 当前会员系统未实现，等同于禁用 LLM
- 所有人都使用本地规则生成

### 模式 3：完全禁用 LLM

```bash
# .env.local
# 不配置 DEEPSEEK_API_KEY
```

**行为**：
- 所有人都使用本地规则生成
- 不产生任何 API 费用

---

## 测试 LLM 功能

### 方法 1：临时启用（推荐）

```bash
# .env.local
ENABLE_LLM_FOR_ALL=true
```

### 方法 2：修改占位函数（不推荐）

```typescript
// utils/membership-placeholder.ts
export function isMemberPlaceholder(): boolean {
  return true; // 临时改为 true
}
```

⚠️ **记得测试完改回 `false`！**

### 验证方法

查看浏览器控制台（F12）：

```
✅ 成功调用：
🤖 Attempting LLM interpretation...
✅ LLM interpretation generated successfully

❌ 未配置 API Key：
⚠️ DEEPSEEK_API_KEY not configured, falling back to local generation

❌ API 调用失败：
❌ DeepSeek API error: ...
⚠️ LLM failed, falling back to local rules
```

---

## 常见问题

### Q1: 提示 "DEEPSEEK_API_KEY not configured"

**A**: 未配置 API Key 或配置错误。

解决方法：
1. 检查 `.env.local` 文件是否存在
2. 检查 API Key 是否正确（以 `sk-` 开头）
3. 重启开发服务器

### Q2: API 调用失败

**A**: 可能的原因：
- API Key 无效或过期
- 网络问题
- DeepSeek 服务异常

解决方法：
- 检查 API Key 是否有效
- 查看 DeepSeek 控制台的使用情况
- 检查网络连接

### Q3: 返回的是本地规则解读，不是 LLM

**A**: 检查以下几点：
1. `ENABLE_LLM_FOR_ALL` 是否设为 `true`
2. `DEEPSEEK_API_KEY` 是否配置正确
3. 查看控制台是否有错误信息

### Q4: 如何区分 LLM 解读和本地规则？

**A**: 查看 API 返回的 `method` 字段：
- `"llm"`: 使用了 LLM
- `"local"`: 使用了本地规则
- `"llm-fallback-local"`: LLM 失败，fallback 到本地规则

或者看控制台输出。

### Q5: 生产环境如何配置？

**A**: 
```bash
# .env.local（生产环境）
DEEPSEEK_API_KEY=sk-xxxxxxxx
ENABLE_LLM_FOR_ALL=false  # 或删除此行

# 然后实现会员系统，修改 membership-placeholder.ts
```

---

## 生产环境部署

### Vercel 部署

1. 在 Vercel 项目设置中添加环境变量：
   - `DEEPSEEK_API_KEY`: 你的 API Key
   - `ENABLE_LLM_FOR_ALL`: `false`（或不设置）

2. 重新部署

### 其他平台

在平台的环境变量配置中添加相同的变量。

---

## 监控和限制

### 建议实施

1. **API 调用监控**
   - 记录每次调用的时间和结果
   - 统计成功率和失败率

2. **频率限制**
   - 同一用户短时间内不要重复调用
   - 缓存解读结果

3. **成本控制**
   - 设置每日/每月 API 调用上限
   - 超过上限时自动 fallback 到本地规则

---

## 支持

如有问题，请参考：
- DeepSeek 文档：https://platform.deepseek.com/docs
- 项目文档：`ANNUAL_FORTUNE_IMPLEMENTATION.md`

---

**最后更新**: 2025-12-27

