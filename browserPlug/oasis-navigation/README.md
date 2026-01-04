# Oasis Navigation - 导航助手

<div align="center">

一个优雅、模块化的浏览器导航插件，支持自定义网站导航、搜索引擎管理和数据云端同步。

[Chrome 插件](#安装) · [Firefox 插件](#安装) · [使用文档](#使用指南) · [开发文档](#开发指南)

</div>

---

## ✨ 功能特性

### 🌐 网站导航
- **分类管理**: 自定义分类，组织你的常用网站
- **网站卡片**: 美观的卡片式布局，支持自定义图标（Emoji 或在线图标）
- **账号信息**: 为每个网站存储账号密码等信息（可选）
- **快速访问**: 点击即可在新标签页或当前标签页打开网站
- **网站置顶**: 将常用网站置顶显示，方便快速访问
- **快捷编辑**: 悬停在网站卡片上即可快速编辑

### 🔍 搜索功能
- **多引擎支持**: 内置 Google、Bing、百度等搜索引擎
- **自定义搜索引擎**: 添加任何你喜欢的搜索引擎
- **快速切换**: 下拉选择不同的搜索引擎
- **本地书签搜索**: 快速搜索已保存的所有网站

### 💾 数据同步
- **云端同步**: 登录 Chrome/Edge 账号自动同步到云端
- **手动备份**: 导出/导入 JSON 格式数据文件
- **百度网盘同步**: 支持备份和恢复到百度网盘
- **导入浏览器书签**: 一键导入浏览器书签到导航助手
- **跨设备**: 在多个设备间无缝同步你的导航设置

### 🎨 界面设计
- **Google 风格**: 简洁美观的 Material Design 风格
- **响应式布局**: 适配各种屏幕尺寸
- **分类横向滚动**: 分类过多时支持横向滚动浏览

### 🛠️ 管理功能
- **分类管理**: 添加、编辑、删除导航分类
- **网站管理**: 添加、编辑、删除网站，支持图标和描述
- **搜索引擎管理**: 自定义搜索引擎列表
- **数据管理**: 导入、导出、清空所有数据

---

## 📦 安装

### 打包
1. 运行打包脚本 ./oasis_navigation_build.bat

### Chrome / Edge

#### 直接加载
1. 下载最新版本的插件包
2. 解压到本地目录
3. 打开浏览器扩展管理页面:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
4. 开启「开发者模式」
5. 点击「加载已解压的扩展程序」
6. 选择解压后的 `oasis-navigation` 目录

#### 加载压缩包
1. 运行上面的打包脚本
2. 打开浏览器扩展管理页面
3. 将压缩包拉进去就行了

#### 在线安装
1. 打开https://microsoftedge.microsoft.com/addons?hl=zh-CN
2. 打开https://chromewebstore.google.com/category/extensions?utm_source=ext_sidebar&hl=zh-CN
2. 搜索 `导航助手(Oasis)`
3. 点击获取安装就行了 

### Firefox

1. 下载最新版本的插件包
2. 解压到本地目录
3. 打开 Firefox 附加组件调试页面: `about:debugging#/runtime/this-firefox`
4. 点击「临时加载附加组件」
5. 选择 `manifest.firefox.json` 文件

#### 加载压缩包
1. 运行上面的打包脚本
2. 打开浏览器扩展管理页面
3. 点击「临时加载附加组件」
4. 选择打包好的压缩包

#### 在线安装
1. 打开 https://addons.mozilla.org/zh-CN/firefox/search/?q=%E5%AF%BC%E8%88%AA%E5%8A%A9%E6%89%8B(Oasis)
2. 搜索 `导航助手(Oasis)`
3. 点击获取安装就行了

---

## 📖 使用指南

### 首次使用

1. **安装插件**: 按照上述安装步骤安装插件
2. **设置新标签页** (可选):
   - 安装新标签页重定向插件
   - 将新标签页指向插件页面
3. **开始使用**: 点击浏览器工具栏中的插件图标

### 添加网站

1. 点击右上角的「管理」按钮
2. 切换到「网站管理」标签
3. 选择分类（或先创建新分类）
4. 填写网站名称、描述、地址
5. 选择图标类型（文字/Emoji 或在线图标）
6. （可选）添加账号信息
7. 点击「添加网站」

### 右键菜单添加

在任何网页上右键 → 选择「添加到导航」即可快速添加当前网站。

### 数据备份

#### 导出到本地
1. 点击「管理」→「数据同步」标签
2. 点击「导出数据」
3. 选择保存位置

#### 导入数据
1. 点击「管理」→「数据同步」标签
2. 点击「导入数据」
3. 选择之前导出的 JSON 文件
4. 选择「合并」或「覆盖」模式

#### 百度网盘同步
1. 点击「登录百度网盘」并完成登录
2. 使用「备份到百度网盘」上传数据
3. 在其他设备上使用「从百度网盘恢复」下载数据

---

## 🏗️ 项目架构

### 模块化设计

本项目采用完全模块化的架构设计，HTML、CSS、JavaScript 都按功能拆分为独立模块。

```
oasis-navigation/
├── 📄 index.html (533B)           # 主入口文件
├── 📄 styles.css (425B)           # 样式入口（导入所有模块）
├── 📄 init.js (673B)              # 初始化脚本
├── 📄 template-loader.js (2.2KB)  # 模板加载器
├── 📄 app.js (49KB)               # 主应用逻辑
├── 📄 background.js (3.3KB)       # 后台脚本
├── 📄 manifest.json               # Chrome 插件配置
├── 📄 manifest.firefox.json       # Firefox 插件配置
│
├── 📁 css/                        # CSS 模块目录
│   ├── base.css                  # 基础样式（重置、通用组件）
│   ├── search-section.css        # 搜索区域样式
│   ├── nav-section.css           # 导航区域样式
│   ├── toolbar.css               # 工具栏样式
│   └── modal.css                 # 模态框样式
│
├── 📁 templates/                  # HTML 模板目录
│   ├── search-section.html       # 搜索区域模板
│   ├── nav-section.html          # 导航区域模板
│   ├── toolbar.html              # 工具栏模板
│   └── modal.html                # 模态框模板
│
└── 📁 _locales/                   # 国际化语言文件
    ├── en/                       # 英语
    └── zh_CN/                    # 简体中文
```

### 模块对应关系

| 功能模块 | HTML 模板 | CSS 样式 | JavaScript | 说明 |
|---------|----------|---------|-----------|------|
| 搜索区域 | `templates/search-section.html` | `css/search-section.css` | `app.js` (第 117-139 行) | 搜索引擎选择和搜索框 |
| 导航区域 | `templates/nav-section.html` | `css/nav-section.css` | `app.js` (第 141-215 行) | 分类标签和网站网格 |
| 工具栏 | `templates/toolbar.html` | `css/toolbar.css` | `app.js` (第 1157-1186 行) | 打开模式和管理按钮 |
| 模态框 | `templates/modal.html` | `css/modal.css` | `app.js` (第 217-395 行) | 管理设置弹窗 |
| 基础样式 | - | `css/base.css` | - | 通用样式和组件 |
| 数据管理 | - | - | `app.js` (第 1-115 行) | 数据存储和同步 |
| CRUD 操作 | - | - | `app.js` (第 396-603 行) | 增删改操作 |
| 数据同步 | - | - | `app.js` (第 605-836 行) | 导入导出 |
| 百度网盘 | - | - | `app.js` (第 839-1155 行) | 网盘备份恢复 |
| 事件绑定 | - | - | `app.js` (第 1188-1247 行) | DOM 事件处理 |

### JavaScript 代码结构

`app.js` (49KB, 1343行) 虽然是单文件，但内部按功能模块清晰组织：

```javascript
// 1. 数据管理模块 (第 1-115 行)
   - 默认数据定义
   - loadData / saveData
   - Chrome Storage 同步

// 2. 搜索引擎模块 (第 117-139 行)
   - renderEngines
   - performSearch

// 3. 导航管理模块 (第 141-215 行)
   - renderCategories
   - renderSites
   - openSite

// 4. 模态框管理模块 (第 217-395 行)
   - 模态框控制
   - 账号字段管理
   - 列表渲染

// 5. CRUD 操作模块 (第 396-603 行)
   - 添加 (addCategory, addSite, addEngine)
   - 编辑 (editSite, updateSite)
   - 删除 (deleteCategory, deleteSite, deleteEngine)

// 6. 数据同步模块 (第 605-836 行)
   - mergeData (智能合并)
   - exportData / importData
   - updateStorageInfo

// 7. 百度网盘同步模块 (第 839-1155 行)
   - 登录管理
   - 备份恢复
   - 状态更新

// 8. UI 更新模块 (第 1157-1186 行)
   - 打开模式切换

// 9. 事件绑定模块 (第 1188-1247 行)
   - bindEventListeners

// 10. 初始化模块 (第 1249-1343 行)
   - init (主初始化)
   - 右键菜单支持
   - 消息监听
```

**为什么保持单文件？**
- ✅ 符合浏览器插件 CSP 要求（无内联脚本）
- ✅ 加载速度快（单个 HTTP 请求）
- ✅ 代码组织清晰，易于维护
- ✅ 适合中小型项目规模

详细的代码结构说明和模块化重构指南，请参阅 [`js/CODE_STRUCTURE.md`](js/CODE_STRUCTURE.md)。

### 加载流程

```
1. 浏览器加载 index.html
   ↓
2. 加载 styles.css → 导入所有 CSS 模块
   ├── css/base.css
   ├── css/search-section.css
   ├── css/nav-section.css
   ├── css/toolbar.css
   └── css/modal.css
   ↓
3. 加载 template-loader.js（模板加载器）
   ↓
4. 加载 init.js（初始化脚本）
   ↓
5. 并行异步加载所有 HTML 模板
   ├── templates/search-section.html
   ├── templates/nav-section.html
   ├── templates/toolbar.html
   └── templates/modal.html
   ↓
6. 模板注入到 DOM
   ↓
7. 触发 templatesLoaded 事件
   ↓
8. 动态加载 app.js（主应用逻辑）
   ↓
9. 应用初始化完成 ✅
```

---

## 💻 开发指南

### 环境要求

- 现代浏览器（Chrome 88+, Firefox 78+, Edge 88+）
- 文本编辑器（推荐 VS Code）
- 基础的 HTML/CSS/JavaScript 知识

### 本地开发

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd oasis-navigation
   ```

2. **加载到浏览器**
   - 按照[安装指南](#安装)加载插件
   - 开启开发者模式

3. **开始开发**
   - 修改代码后刷新插件即可看到效果
   - 使用浏览器开发者工具调试

### 添加新功能

#### 1. 添加新的 UI 组件

```bash
# 创建 HTML 模板
touch templates/new-component.html

# 创建 CSS 样式
touch css/new-component.css
```

在 `template-loader.js` 中注册模板:
```javascript
const templates = [
  // ... 现有模板
  { id: 'new-component', file: 'templates/new-component.html', target: '.container' }
];
```

在 `styles.css` 中导入样式:
```css
@import url('css/new-component.css');
```

在 `app.js` 中添加业务逻辑。

#### 2. 修改现有组件

- **修改 HTML**: 编辑 `templates/` 下的对应文件
- **修改样式**: 编辑 `css/` 下的对应文件
- **修改逻辑**: 编辑 `app.js`
- **刷新插件**: 在扩展管理页面重新加载插件

---

## 📋 待办事项

- [x] 搜索书签内容功能
- [x] 网站置顶功能
- [x] 网站卡片上的快捷编辑按钮
- [x] 导入浏览器书签
- [x] 需要考虑列表分类太多的问题

---



## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](../../LICENSE) 文件

---

