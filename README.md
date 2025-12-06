# 算命 - Mystic Insights

一个集成了塔罗占卜功能的 Next.js 应用程序，支持多种牌阵和 AI 解读。

## 功能特性

### 🎴 四季牌阵
- 从5个不同维度抽取塔罗牌：
  - **行动与主动性** (Wands - 权杖牌组)
  - **情感和人际关系** (Cups - 圣杯牌组)
  - **智慧与思想** (Swords - 宝剑牌组)
  - **事业和财运** (Pentacles - 星币牌组)
  - **本季核心主题** (Major Arcana - 大阿卡那牌组)
- 使用 DeepSeek AI 生成深度个性化解读
- 温柔、清晰、务实的解读风格

### 📅 月运牌阵
- 支持基础版和会员版月运
- 7张牌阵解读本月各个方面的运势

## 环境配置

### 必需的环境变量

在项目根目录创建 `.env.local` 文件，添加以下配置：

```env
# DeepSeek API Key
# 获取地址：https://platform.deepseek.com/
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 获取 DeepSeek API Key

1. 访问 [DeepSeek 平台](https://platform.deepseek.com/)
2. 注册并登录账号
3. 在 API Keys 页面创建新的 API Key
4. 将 API Key 复制到 `.env.local` 文件中

## 安装与运行

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build

# 运行生产版本
npm start
```

## 技术栈

- **框架**: Next.js
- **UI**: React, Tailwind CSS, Framer Motion
- **AI 解读**: DeepSeek API
- **图片存储**: Supabase Storage

## API 端点

### `/api/seasonal-draw`
- 方法: GET
- 功能: 从指定牌池抽取塔罗牌
- 参数: `slot` (1-5), `sessionId` (可选)

### `/api/seasonal-reading`
- 方法: POST
- 功能: 生成四季牌阵的 AI 解读
- 参数: `cards` (5张塔罗牌数组)

### `/api/monthly-member-fortune`
- 方法: POST
- 功能: 生成月运牌阵的 AI 解读
- 参数: `cards` (7张塔罗牌数组)

## 许可证

MIT

