# 主题占卜 - 爱情主题测试指南

## 快速开始

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 测试路由

#### 方式一：从首页进入
1. 访问 `http://localhost:3000/`
2. 找到「主题占卜 Themed Readings」卡片
3. 点击「爱情 (Love)」按钮
4. 应该跳转到 `http://localhost:3000/themed-readings/love`

#### 方式二：直接访问
直接在浏览器中访问：
- `http://localhost:3000/themed-readings/love`

### 3. 测试牌阵卡片

#### 免费牌阵测试
1. 在爱情主题页面，找到以下两个牌阵：
   - **感情现状** (Relationship Snapshot) - 有 "Most Popular" 标签
   - **对方想法** (Their Feelings Quick Read)

2. 点击任一免费牌阵的「Start Reading」按钮

3. 应该跳转到详情页，例如：
   - `http://localhost:3000/themed-readings/love/love-relationship-snapshot`
   - `http://localhost:3000/themed-readings/love/love-their-feelings`

4. 详情页应该显示：
   - ✅ 牌阵标题（中英文）
   - ✅ 牌阵信息（张数、预计时间等）
   - ✅ "功能开发中" 占位提示
   - ✅ 禁用的「开始占卜」按钮
   - ✅ 「返回选择」按钮可用

#### 付费牌阵测试
1. 在爱情主题页面，找到以下四个牌阵：
   - **关系走向** (Relationship Outcome)
   - **复合可能** (Reconciliation Potential)
   - **深层连接** (Deep Connection)
   - **行动建议** (Action Guidance)

2. 这些卡片应该显示：
   - ✅ 右上角有 "Members Only" 锁标识
   - ✅ 按钮文案为「Unlock to Read」

3. 点击任一付费牌阵

4. 应该弹出会员提示弹窗，显示：
   - ✅ 锁图标
   - ✅ "会员专享 Members Only" 标题
   - ✅ 说明文字
   - ✅ 「了解更多 Learn More」按钮
   - ✅ 「返回 Back」按钮

5. 点击弹窗外部或「返回」按钮应该关闭弹窗

### 4. 测试响应式布局

#### 桌面视图（>= 1024px）
- 牌阵应该显示为 **3 列**网格布局

#### 平板视图（768px - 1023px）
- 牌阵应该显示为 **2 列**网格布局

#### 移动视图（< 768px）
- 牌阵应该显示为 **1 列**堆叠布局

### 5. 测试交互效果

#### Hover 效果
- ✅ 免费牌阵 hover 时有轻微放大（scale-[1.02]）和发光效果
- ✅ 付费牌阵 hover 时有背景变亮效果
- ✅ 按钮 hover 时有颜色变化

#### 点击效果
- ✅ 返回按钮：返回上一页
- ✅ 免费牌阵：进入详情页
- ✅ 付费牌阵：打开会员弹窗
- ✅ 弹窗关闭：点击背景或关闭按钮

### 6. 测试边界情况

#### 无效牌阵 ID
1. 访问不存在的牌阵 ID：
   `http://localhost:3000/themed-readings/love/invalid-spread-id`

2. 应该显示：
   - ✅ "牌阵未找到" 错误页面
   - ✅ 返回按钮

#### 直接访问付费牌阵（未登录）
1. 直接访问付费牌阵 URL：
   `http://localhost:3000/themed-readings/love/love-relationship-outcome`

2. 应该显示：
   - ✅ "会员专享内容" 提示页面
   - ✅ 返回按钮

## 检查清单

### 页面渲染
- [ ] 首页「爱情 (Love)」按钮显示正常
- [ ] 爱情主题页面标题与描述显示正确
- [ ] 6 个牌阵卡片全部显示
- [ ] 免费/付费标识正确显示

### 路由跳转
- [ ] 首页 → 爱情主题页面
- [ ] 爱情主题页面 → 免费牌阵详情页
- [ ] 返回按钮正常工作

### 会员控制
- [ ] 付费牌阵显示锁标识
- [ ] 点击付费牌阵触发弹窗
- [ ] 弹窗内容正确显示
- [ ] 弹窗可以正常关闭

### UI/UX
- [ ] 深色主题正确应用
- [ ] 紫色主题色一致
- [ ] Hover 动画流畅
- [ ] 响应式布局正确
- [ ] 图标显示正常

### 性能
- [ ] 页面加载速度快
- [ ] 无控制台错误
- [ ] 无 linter 警告

## 已知限制（符合预期）

1. **会员状态固定为 false**
   - 当前为 mock 数据，所有用户都显示为非会员
   - 所有付费牌阵都会被锁定

2. **牌阵详情页为占位**
   - 没有实际的抽牌功能
   - 没有 AI 解读
   - 「开始占卜」按钮已禁用

3. **仅实现爱情主题**
   - 事业（Career）和财富（Wealth）主题尚未实现
   - 首页按钮暂时保持原样

## 下一步

如果所有测试通过，可以继续以下工作：

1. **接入会员系统**
   - 修改 `hooks/useMembership.ts`
   - 接入真实的认证 API

2. **实现抽牌功能**
   - 添加抽牌交互组件
   - 实现卡牌动画效果

3. **接入 AI 解读**
   - 集成 DeepSeek API
   - 实现解读内容展示

4. **添加其他主题**
   - 复制爱情主题结构
   - 定义事业和财富的牌阵

---

**测试环境**: Next.js Dev Server  
**浏览器建议**: Chrome / Edge / Safari 最新版

