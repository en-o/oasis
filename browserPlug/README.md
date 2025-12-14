# 打包
> cd /mnt/c/work/组件/服务套件/oasis/browserPlug/google
> zip -r ../chrome-extension.zip ./*
1. 运行打包脚本 `./build.sh` 或 `build.bat`
2. 按照 PUBLISH_GUIDE.md 准备截图
3. 上传到商店：
   - Chrome: https://chrome.google.com/webstore/devconsole
   - Edge: https://partner.microsoft.com/dashboard/microsoftedge/overview

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
3. 上传插件的 ZIP 包（将 browserPlug/google 目录打包）
4. 填写商品详情：
   - 详细说明
   - 上传截图和宣传图片
   - 选择类别（生产力工具）
   - 设置隐私权政策（如适用）
5. 提交审核（通常 1-3 天）
