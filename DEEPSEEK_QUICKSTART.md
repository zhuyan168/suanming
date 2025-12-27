# DeepSeek LLM 快速启用指南

## ⚡ 3 步启用 LLM

### 1️⃣ 获取 API Key

访问：https://platform.deepseek.com/api_keys

复制你的 API Key（以 `sk-` 开头）

### 2️⃣ 创建配置文件

在项目根目录创建 `.env.local` 文件：

```bash
# 必需：DeepSeek API Key
DEEPSEEK_API_KEY=sk-你的实际key

# 可选：临时启用 LLM（用于测试）
ENABLE_LLM_FOR_ALL=true
```

### 3️⃣ 重启服务器

```bash
npm run dev
```

---

## ✅ 验证是否生效

访问：`http://localhost:3000/annual-fortune`

1. 点击「生成测试数据」
2. 打开浏览器控制台（F12）
3. 查看输出：

```
✅ 成功：
🤖 Attempting LLM interpretation...
✅ LLM interpretation generated successfully

❌ 失败：
⚠️ DEEPSEEK_API_KEY not configured
```

---

## 🎯 新功能预览

### 生活化解读

LLM 版本的解读更加：
- **具体场景**："3月适合主动沟通新项目，可以约关键人物面谈"
- **可执行建议**："下半年财务上建议保守一些，大额支出前多考虑"
- **月份节奏**："6月前后人际关系比较活跃，适合扩展社交圈"

### 每月注意事项（新增）

每个月现在都有专属的注意事项：

```json
{
  "monthlyNote": "春季开始，活力上升，适合启动新计划"
}
```

在结果页会显示为蓝色的「📌 本月注意」卡片。

---

## 🔧 配置说明

### 开发模式（所有人使用 LLM）

```bash
# .env.local
DEEPSEEK_API_KEY=sk-xxxxxxxx
ENABLE_LLM_FOR_ALL=true  # 👈 这一行启用测试模式
```

### 生产模式（只有会员使用）

```bash
# .env.local
DEEPSEEK_API_KEY=sk-xxxxxxxx
ENABLE_LLM_FOR_ALL=false  # 或删除这一行
```

当前会员系统未实现，所以生产模式 = 禁用 LLM。

---

## 💰 费用

**单次解读**：约 ¥0.006（不到 1 分钱）

| 用户数/年 | 年度费用 |
|-----------|----------|
| 100       | ¥0.6     |
| 1,000     | ¥6       |
| 10,000    | ¥60      |

成本极低，可忽略不计。

---

## 🐛 常见问题

### Q: 提示 API Key 未配置

**A**: 
1. 检查 `.env.local` 是否存在
2. 检查 API Key 是否正确
3. 重启服务器

### Q: 还是本地规则解读

**A**: 
1. 确认 `ENABLE_LLM_FOR_ALL=true`
2. 查看控制台是否有错误
3. 确认 API Key 有效

### Q: 如何关闭 LLM？

**A**: 
1. 删除 `DEEPSEEK_API_KEY`，或
2. 设置 `ENABLE_LLM_FOR_ALL=false`

---

## 📚 完整文档

详见：`DEEPSEEK_SETUP_GUIDE.md`

---

**享受你的 AI 增强版年度运势！** 🎉

