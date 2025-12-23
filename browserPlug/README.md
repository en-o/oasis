# oasis-navigation
浏览器插件项目，独立的 oasis
> ![oasis-navigation_img.png](image/oasis-navigation_img.png)[img.png](browserPlug/image/img.png)
文件说明：
1. manifest.json - Chrome/Edge 版本（Manifest V3）
2. manifest.firefox.json - Firefox 版本（Manifest V2，使用 background.scripts）
3. oasis_navigation_build-all.ps1 - 新的打包脚本，支持分别打包 Chrome 和 Firefox 版本
4. oasis_navigation_build.bat - 入口脚本，自动调用oasis_navigation_ build-all.ps1

## 打包
> cd /mnt/c/work/组件/服务套件/oasis/browserPlug/oasis-navigation
> zip -r ../chrome-extension.zip ./*
1. 运行打包脚本 `./oasis_navigation_build.bat`
2. 按照 PUBLISH_GUIDE.md 准备截图
3. 上传到商店：
   - Chrome: https://chrome.google.com/webstore/devconsole
   - Edge: https://partner.microsoft.com/dashboard/microsoftedge/overview

# [oasisassist](oasisassist/README.md)
当前项目的一个辅助插件，是将导航添加功能封装成支持Chrome、Edge和Firefox的扩展，用于快捷添加

## 打包
```batch
cd ./oasisassist && build.bat
```
打包后会在以下位置生成文件：
- `dist/oasisassist-chrome.zip` - Chrome/Edge版本
- `dist/oasisassist-firefox.zip` - Firefox版本
- `../../reactWeb/public/extensions/` - 自动复制到前端项目
## API服务器地址配置说明

默认地址：`http://localhost:9527`

可以配置为：
- 本地开发：`http://localhost:9527`
- 局域网访问：`http://192.168.x.x:9527`
- 生产环境：`https://your-domain.com`


# 发布
## 微软
> https://blog.csdn.net/ouyyan/article/details/145378358
1. 访问 https://partner.microsoft.com/dashboard/microsoftedge/overview
2. 创建新提交
3. 上传相同的 ZIP 包
4. 填写商品详情（与 Chrome 类似）
5. 提交审核（通常 3-7 天）

## 火狐
> https://developer.aliyun.com/article/1650354

1. 访问 https://addons.mozilla.org/zh-CN/developers
2. 创建新提交
3. 上传相同的 ZIP 包
4. 填写商品详情
5. 提交审核

## google （要钱我就没弄
1. 访问 https://chrome.google.com/webstore/devconsole
2. 点击"新增项目"
3. 上传插件的 ZIP 包（将 browserPlug/oasis-navigation 目录打包）
4. 填写商品详情：
   - 详细说明
   - 上传截图和宣传图片
   - 选择类别（生产力工具）
   - 设置隐私权政策（如适用）
5. 提交审核（通常 1-3 天）
