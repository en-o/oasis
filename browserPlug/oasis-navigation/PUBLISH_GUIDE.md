# 导航助手 - 发布指南

## 开发者中心
firefox: https://addons.mozilla.org/zh-CN/developers/
chrome: https://chrome.google.com/webstore/devconsole/
edge: https://partner.microsoft.com/zh-cn/dashboard/microsoftedge/


## 📸 截图和宣传素材要求

### Chrome 网上应用店要求

#### 1. 必需素材

**小型宣传图块（必需）**
- 尺寸：440 x 280 像素
- 格式：PNG 或 JPG
- 建议内容：展示主要功能的精美界面截图

**截图（至少 1 张，建议 3-5 张）**
- 尺寸：1280 x 800 或 640 x 400 像素
- 格式：PNG 或 JPG
- 最多 5 张

**大型宣传图块（可选但推荐）**
- 尺寸：920 x 680 像素
- 格式：PNG 或 JPG

**侯爵宣传图块（可选）**
- 尺寸：1400 x 560 像素
- 用于精选展示

---

## 📋 推荐截图内容

### 截图 1：主界面 - 搜索和导航
**内容：**
- 展示顶部搜索栏（引擎选择 + 搜索框）
- 展示分类标签（常用、工作、娱乐）
- 展示网站卡片网格布局
- 右上角管理按钮

**拍摄建议：**
- 浏览器窗口最大化
- 分辨率：1920x1080
- 填充一些示例数据（6-12个网站）
- 使用真实的网站图标（如 Google、GitHub 等）

**标题建议：** "优雅的新标签页 - 快速搜索和导航"

---

### 截图 2：网站管理界面
**内容：**
- 打开管理模态框
- 选中"网站管理"标签
- 显示添加网站表单
- 显示已添加的网站列表（带编辑/删除按钮）

**拍摄建议：**
- 表单填写部分示例数据
- 展示账号信息的键值对输入（添加 2-3 个字段示例）
- 网站列表显示 3-5 个网站

**标题建议：** "强大的网站管理 - 支持账号信息保存"

---

### 截图 3：分类管理
**内容：**
- 打开管理模态框
- 选中"分类管理"标签
- 显示多个自定义分类
- 显示添加分类的界面

**标题建议：** "灵活的分类管理 - 个性化组织"

---

### 截图 4：搜索引擎管理
**内容：**
- 打开管理模态框
- 选中"搜索引擎"标签
- 显示多个搜索引擎（Google、Bing、Baidu、GitHub等）
- 展示添加自定义搜索引擎的表单

**标题建议：** "自定义搜索引擎 - 一键切换"

---

### 截图 5（可选）：网站卡片详情
**内容：**
- 近距离展示几个精美的网站卡片
- 显示带账号信息的卡片
- 展示 hover 效果（阴影）

**标题建议：** "简洁美观的卡片设计"

---

## 🎨 截图拍摄步骤

### 准备工作

1. **添加示例数据**
   ```javascript
   // 在浏览器控制台执行，添加丰富的示例数据
   const demoData = {
     engines: [
       { name: 'Google', url: 'https://www.google.com/search?q={query}' },
       { name: 'Bing', url: 'https://www.bing.com/search?q={query}' },
       { name: 'GitHub', url: 'https://github.com/search?q={query}' },
       { name: 'Stack Overflow', url: 'https://stackoverflow.com/search?q={query}' }
     ],
     categories: ['常用', '工作', '娱乐', '学习', '工具'],
     sites: {
       '常用': [
         { name: 'Google', icon: '🔍', url: 'https://www.google.com', desc: '全球最大搜索引擎', accountInfo: {} },
         { name: 'GitHub', icon: '💻', url: 'https://github.com', desc: '代码托管平台', accountInfo: { '账号': 'demo@example.com' } },
         { name: 'Gmail', icon: '📧', url: 'https://mail.google.com', desc: '谷歌邮箱', accountInfo: {} },
         { name: 'YouTube', icon: '🎥', url: 'https://youtube.com', desc: '视频分享网站', accountInfo: {} }
       ],
       '工作': [
         { name: 'Slack', icon: '💬', url: 'https://slack.com', desc: '团队协作工具', accountInfo: { '工作区': 'company.slack.com' } },
         { name: 'Notion', icon: '📝', url: 'https://notion.so', desc: '笔记和文档', accountInfo: {} },
         { name: 'Figma', icon: '🎨', url: 'https://figma.com', desc: 'UI设计工具', accountInfo: {} }
       ],
       '娱乐': [
         { name: 'Netflix', icon: '🎬', url: 'https://netflix.com', desc: '在线视频', accountInfo: {} },
         { name: 'Spotify', icon: '🎵', url: 'https://spotify.com', desc: '音乐流媒体', accountInfo: {} }
       ],
       '学习': [
         { name: 'Coursera', icon: '🎓', url: 'https://coursera.org', desc: '在线课程', accountInfo: {} },
         { name: 'MDN', icon: '📚', url: 'https://developer.mozilla.org', desc: 'Web开发文档', accountInfo: {} }
       ],
       '工具': [
         { name: 'ChatGPT', icon: '🤖', url: 'https://chat.openai.com', desc: 'AI助手', accountInfo: {} },
         { name: 'DeepL', icon: '🌐', url: 'https://deepl.com', desc: '翻译工具', accountInfo: {} }
       ]
     }
   };
   localStorage.setItem('navData', JSON.stringify(demoData));
   location.reload();
   ```

2. **设置浏览器**
   - 分辨率：1920x1080（全屏）
   - 隐藏书签栏
   - 关闭其他标签页
   - 使用无痕模式（干净的浏览器环境）

3. **截图工具**
   - Windows：Win + Shift + S（推荐使用 Snipaste）
   - Mac：Cmd + Shift + 4
   - 或使用浏览器扩展：Awesome Screenshot

### 拍摄技巧

1. **确保清晰度**
   - 使用原生分辨率截图
   - 不要缩放浏览器窗口

2. **保持一致性**
   - 所有截图使用相同的浏览器窗口大小
   - 使用相同的示例数据

3. **突出重点**
   - 可以添加箭头或高亮标注（使用图片编辑工具）
   - 但不要过度装饰

4. **光标处理**
   - 截图时移开鼠标光标
   - 或者让光标指向重要功能

---

## 📝 商店详情文案建议

### 简短描述（132 字符以内）
```
优雅的新标签页扩展，支持自定义搜索引擎、网站导航管理、账号信息保存。Google 风格设计，简洁高效。
```

### 详细描述

```markdown
# 导航助手 - 您的个性化新标签页

一款优雅、简洁、高效的新标签页扩展，采用 Google Material Design 风格设计，为您打造完美的浏览器起始页。

## ✨ 主要功能

### 🔍 多搜索引擎支持
- 内置 Google、Bing、百度等主流搜索引擎
- 支持添加自定义搜索引擎
- 一键切换，快速搜索

### 📁 智能分类管理
- 创建多个自定义分类
- 灵活组织您的常用网站
- 分类标签快速切换

### 🌐 网站快速访问
- 精美的卡片式布局
- 支持自定义网站图标（Emoji）
- 鼠标悬停查看详情

### 🔐 账号信息管理
- 安全保存网站账号信息
- 键值对格式，灵活配置
- 本地存储，隐私安全

### 🎨 简洁美观的设计
- Google 风格 UI
- 素雅的配色方案
- 流畅的交互动画

## 🛡️ 隐私承诺

- 所有数据仅存储在您的浏览器本地
- 不收集、不上传任何个人信息
- 无广告、无追踪

## 💡 使用场景

- 快速访问常用网站
- 管理工作相关的多个平台
- 保存各类账号信息备忘
- 切换不同搜索引擎
- 个性化浏览器起始页

## 🚀 快速开始

1. 安装扩展
2. 打开新标签页
3. 点击右上角"管理"按钮
4. 开始添加您的网站和搜索引擎

立即体验优雅高效的浏览新方式！
```

### 类别选择
- **主要类别**：生产力工具 (Productivity)
- **次要类别**：工具 (Tools)

### 标签（Tags）
```
新标签页, 导航, 书签管理, 搜索引擎, 快速访问, productivity, new tab, navigation, bookmark manager
```

---

## 🌍 本地化建议

### 支持语言
1. **中文（简体）** - 默认
2. **英语** - 推荐添加

### 英文版描述
**Short Description:**
```
Elegant new tab page with custom search engines, website navigation, and account management. Google-inspired design.
```

**Detailed Description:**
```markdown
# Smart Navigation - Your Personalized New Tab Page

An elegant, clean, and efficient new tab extension with Google Material Design, creating the perfect browser home page.

## ✨ Key Features

- 🔍 Multiple search engines support
- 📁 Smart category management
- 🌐 Quick website access
- 🔐 Account information storage
- 🎨 Clean Google-style design

## 🛡️ Privacy First

- All data stored locally
- No data collection or upload
- No ads, no tracking
```

---

## 📦 发布检查清单

### 提交前检查

- [ ] manifest.json 信息完整准确
- [ ] 版本号已更新（建议 1.0.0）
- [ ] 图标文件齐全（16x16, 48x48, 128x128）
- [ ] 准备好 5 张截图
- [ ] 准备好小型宣传图块（440x280）
- [ ] 详细描述已撰写
- [ ] 隐私政策链接（如需要）
- [ ] 使用打包脚本生成 ZIP 文件
- [ ] 测试安装包在本地能正常运行

### 审核要点

1. **权限说明**
   - `storage`: 用于本地保存用户的导航设置和网站信息

2. **功能完整性**
   - 确保所有功能正常工作
   - 没有控制台错误

3. **隐私政策**
   - 明确说明不收集用户数据
   - 数据仅存储在本地

---

## 🎯 优化建议

### 提高曝光率

1. **关键词优化**
   - 在名称和描述中包含：新标签页、导航、书签、搜索

2. **高质量截图**
   - 清晰展示核心功能
   - 添加简短文字说明

3. **及时回复评论**
   - 积极响应用户反馈
   - 解答使用问题

4. **定期更新**
   - 修复 bug
   - 添加新功能
   - 保持活跃度

---
