# Oasis 导航助手 浏览器插件

快速添加网页到Oasis导航系统的浏览器插件，支持Chrome、Edge和Firefox。

## 功能特性

- ✅ 右键菜单快速添加当前页面到导航
- ✅ 点击插件图标添加当前页面
- ✅ 自动填充页面标题和URL
- ✅ 支持自定义图标（URL或上传）
- ✅ 支持设置分类、排序等完整属性
- ✅ 可配置API服务器地址
- ✅ 支持Chrome、Edge、Firefox三大浏览器
- ✅ **Token身份认证，保护数据安全**
- ✅ **自动检测登录状态，403错误自动提示登录**

## 安装方法

### Chrome / Edge

1. 下载 `oasisassist-chrome.zip`
2. 解压到任意目录
3. 打开浏览器，进入扩展程序管理页面：
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
4. 开启"开发者模式"
5. 点击"加载已解压的扩展程序"
6. 选择解压后的文件夹

### Firefox

1. 下载 `oasisassist-firefox.zip`
2. 打开Firefox，进入 `about:debugging#/runtime/this-firefox`
3. 点击"临时加载附加组件"
4. 选择解压后目录中的 `manifest.json` 文件

注意：Firefox临时加载的插件在浏览器重启后会失效，需要重新加载。如需永久安装，需要发布到Firefox Add-ons商店。

## 使用方法

### 首次使用

1. 点击插件图标，选择"设置"
2. 配置API服务器地址（例如：`http://localhost:9527`）
3. 点击"测试连接"确保连接成功
4. 保存设置

### 登录认证

插件使用 Token 进行身份认证，确保数据安全：

**自动登录提示**
- 当插件检测到需要登录（403错误）时，会自动弹出登录窗口
- 使用 Oasis 管理后台的账号密码登录
- 登录成功后 Token 会自动保存，无需重复登录

**登录流程**
1. 首次使用或 Token 过期时，会提示"登录已过期，请重新登录"
2. 自动打开登录窗口
3. 输入用户名和密码
4. 登录成功后窗口自动关闭
5. 重新执行之前的操作

**Token 管理**
- Token 存储在浏览器本地存储中
- 所有 API 请求自动携带 Token
- Token 过期时会自动提示重新登录
- 支持多个浏览器实例共享 Token

### 添加导航

**方式1：右键菜单**
- 在任意网页上右键点击
- 选择"添加到Oasis导航"
- 在弹出的表单中填写信息
- 点击"添加"提交

**方式2：插件图标**
- 点击浏览器工具栏上的插件图标
- 点击"添加当前页面"按钮
- 在弹出的表单中填写信息
- 点击"添加"提交

## 表单字段说明

- **名称**：导航项的显示名称（必填）
- **URL**：网页地址（必填，必须是http或https）
- **分类**：选择一个已存在的分类（必填）
- **排序**：显示顺序，数字越小越靠前
- **图标**：可选择无图标、URL地址或上传图片
- **备注**：导航描述信息
- **账户信息**：可选填登录账号和密码
- **发布页面**：选择在哪个页面显示，留空表示所有页面
- **状态**：是否启用该导航项

## 开发构建

### 目录结构

```
oasisassist/
├── manifest.json           # Chrome/Edge配置
├── manifest.firefox.json   # Firefox配置
├── background.js          # 后台脚本（右键菜单）
├── popup.html/js          # 插件弹窗
├── add.html/js            # 添加表单页面
├── login.html/js          # 登录认证页面
├── options.html/js        # 设置页面
├── icons/                 # 图标文件
├── build.bat              # Windows打包脚本
├── build.sh               # Linux/Mac打包脚本
└── README.md              # 说明文档
```

### 打包方法

**Windows:**
```batch
build.bat
```

**Linux/Mac:**
```bash
chmod +x build.sh
./build.sh
```

打包后会在以下位置生成文件：
- `dist/oasisassist-chrome.zip` - Chrome/Edge版本
- `dist/oasisassist-firefox.zip` - Firefox版本
- `../../reactWeb/public/extensions/` - 自动复制到前端项目

## 配置说明

### API服务器地址

默认地址：`http://localhost:9527`

可以配置为：
- 本地开发：`http://localhost:9527`
- 局域网访问：`http://192.168.x.x:9527`
- 生产环境：`https://your-domain.com`
- 有基础路径的部署：`https://your-domain.com/oasis`（自动处理 VITE_BASE_PATH）


### 权限说明

插件需要以下权限：
- `contextMenus`：创建右键菜单
- `tabs`：获取当前标签页信息
- `activeTab`：访问活动标签页
- `storage`：保存配置信息和身份认证 Token
- `http://*/*` 和 `https://*/*`：访问API服务器
- `windows`：创建弹窗（登录窗口、添加窗口等）

## 注意事项

1. 使用前请确保Oasis后端服务正常运行
2. 首次使用需要在设置中配置API服务器地址
3. **首次添加导航时会自动提示登录，请使用管理后台的账号密码**
4. 图标文件支持JPG/PNG/GIF/WEBP格式，不支持SVG
5. 上传图片会转换为Base64存储，建议控制在2MB以内
6. 跨域访问需要后端配置CORS
7. Token 会持久保存，除非手动清除浏览器数据或 Token 过期

## 故障排查

### 无法连接服务器
- 检查API地址是否正确
- 确认后端服务已启动
- 检查网络连接
- 查看浏览器控制台错误信息

### 登录认证问题
- **403 错误或提示"需要登录"**：Token 已过期或无效，请重新登录
- **登录窗口无法打开**：检查浏览器是否阻止了弹窗
- **登录成功但仍提示需要登录**：检查 Token 是否正确保存到 storage
- **查看已保存的 Token**：在浏览器控制台运行 `chrome.storage.local.get(['authToken'], console.log)`
- **手动清除 Token**：在浏览器控制台运行 `chrome.storage.local.remove(['authToken'])`

### 无法加载分类
- 确保后端分类数据存在
- 检查API接口是否正常
- 在设置页面测试连接

### 提交失败
- 检查必填字段是否填写
- 确认URL格式正确
- 查看后端日志排查错误

## 版本信息

- 版本：1.0.0
- 作者：Oasis Team
- 许可：与Oasis主项目相同

## 相关链接

- Oasis主项目：[项目仓库地址]
- 问题反馈：[Issues地址]
