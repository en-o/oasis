# todo
- [ ] 可以搜索书签的内容
- [ ] 书签可以置顶，太多了就不好看了
- [ ] 书签列表中的书签可以在右下角新增一个编辑的功能



# 模块说明

## 项目结构

```
oasis-navigation/
├── index.html              # 主入口文件 (1.1KB)
├── styles.css              # 样式入口文件 (导入所有模块样式)
├── template-loader.js      # 模板加载器 (2.2KB)
├── app.js                  # 主应用逻辑 (49KB)
├── background.js           # 后台脚本 (3.3KB)
├── manifest.json           # Chrome 插件配置
├── manifest.firefox.json   # Firefox 插件配置
├── css/                    # CSS 模块目录
│   ├── base.css           # 基础样式 (重置、通用组件)
│   ├── search-section.css # 搜索区域样式
│   ├── nav-section.css    # 导航区域样式
│   ├── toolbar.css        # 工具栏样式
│   └── modal.css          # 模态框样式
├── templates/              # HTML 模板目录
│   ├── search-section.html # 搜索区域模板
│   ├── nav-section.html    # 导航区域模板
│   ├── toolbar.html        # 工具栏模板
│   └── modal.html          # 模态框模板
└── _locales/              # 国际化语言文件
    ├── en/
    └── zh_CN/
```

## 加载流程

```
1. 浏览器加载 index.html
   ↓
2. 加载 styles.css
   ├── 导入 css/base.css
   ├── 导入 css/search-section.css
   ├── 导入 css/nav-section.css
   ├── 导入 css/toolbar.css
   └── 导入 css/modal.css
   ↓
3. 加载 template-loader.js
   ↓
4. 并行异步加载所有 HTML 模板
   ├── templates/search-section.html
   ├── templates/nav-section.html
   ├── templates/toolbar.html
   └── templates/modal.html
   ↓
5. 模板注入到 DOM
   ↓
6. 触发 templatesLoaded 事件
   ↓
7. 动态加载 app.js
   ↓
8. 应用初始化完成
```

# 开发指南
