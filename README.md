# Oasis · 站点导航


# 快速使用
> https://hub.docker.com/r/tannnn/oasis
```yaml
docker run -d \
  --name oasis \
  -p 1249:1249 \
  -e OASIS_DEF_UNAME=admin \
  -e OASIS_DEF_PWD=123 \
  -e OASIS_DEF_SITE_TITLE="OASIS" \
  -e H2_CONSOLE_ENABLED=false \
  -v $(pwd)/api/db:/app/db \
  -v $(pwd)/logs:/app/logs \
  --restart unless-stopped \
  tannnn/oasis:0.0.3.6
```

# H2
浏览器访问 http://localhost:1249/h2
JDBC URL：jdbc:h2:file:./api/db/db_oasis
用户名/密码：sa / sa


# web
> reactWeb
```bash
npm install
npm run dev
```
admin: http://localhost:3000/admin
nva: http://localhost:3000

# 自定义发布页面
> 默认导航加载的是 `nav_item.showPlatform is null` 和`nav_item.status = 1` 的

支持为不同场景创建独立的导航页面，每个页面有独立的路由路径和配置：
- **路由路径**：如 `dev`、`cp`、`public`，访问 `http://localhost:3000/dev`
- **页面配置**：可单独设置是否隐藏管理入口
- **导航过滤**：每个导航项可指定在哪些页面显示（在 showPlatform 字段填写逗号分隔的路径，如 `dev,cp`）

**管理入口**：后台 → 发布页面管理


# build
注意h2控制台我没关，接口文件地址我也没关

## JAR
```shell
cd api
mvn clean package
```
这会自动执行：
1. 安装 Node.js 和 npm
2. 执行 npm install
3. 执行 npm run build:merged（将前端构建到 api/src/main/resources/static）
4. 打包 jar 并将资源文件拷贝到 target/output/resources/static
```text
  📁 打包产物结构
  api/target/output/
  ├── api-0.0.1-SNAPSHOT.jar    # 主 jar 包（只包含 Java 类）
  ├── lib/                       # 所有依赖 jar
  └── resources/                 # 资源文件
      ├── static/                # React 前端静态文件（在这里！）
      │   ├── index.html
      │   ├── js/
      │   ├── css/
      │   └── assets/
      ├── application.yml
      └── ...其他配置文件
```

🚀 运行方式
cd api/target/output
java -jar api-0.0.1-SNAPSHOT.jar
访问：http://127.0.0.1:1249


## docker build 
> - 版本根据[pom.xml](api/pom.xml)，每次发行版本之后都要用新的版本进行开发
> - 当前最新：0.0.3.6
###  一键构建
./docker-build.sh [版本号]        # Linux/Mac
docker-build.bat  [版本号]        # Windows

### 分步构建
1. 本地打包 `./build-local.sh`

2. Docker 镜像构建 `docker build -t tannnn/oasis:latest -f api/Dockerfile .`

### 运行 
> dockerhub:  https://hub.docker.com/r/tannnn/oasis
```yaml
docker run -d \
  --name oasis \
  -p 1249:1249 \
  -e OASIS_DEF_UNAME=admin \
  -e OASIS_DEF_PWD=123 \
  -e OASIS_DEF_SITE_TITLE="OASIS" \
  -v $(pwd)/api/db:/app/db \
  -v $(pwd)/logs:/app/logs \
  --restart unless-stopped \
  tannnn/oasis:latest
```


# oasis辅助工具-[快捷添加导航插件](browserPlug/oasisassist)

一个浏览器插件，支持快速添加网页到 Oasis 导航系统。右键点击网页即可添加，自动填充页面信息和图标。

**主要功能**：
- ✅ 右键菜单快速添加当前页面
- ✅ 自动填充标题、URL、备注和图标
- ✅ Token 身份认证，自动拦截登录
- ✅ 支持 Chrome、Edge、Firefox

**快速开始**：
1. 下载插件：管理后台 → 浏览器插件
2. 安装插件：拖拽 ZIP 文件到浏览器扩展页面
3. 配置 API 地址：点击插件图标 → 设置
4. 右键网页 → "添加到Oasis导航"

详细文档：[browserPlug/oasisassist/README.md](browserPlug/oasisassist/README.md)


# 单独的[浏览器插件](browserPlug/README.md)
> browserPlug 更当前的项目关系不大，一个纯html的浏览器导航插件
> ![oasis-navigation_img.png](browserPlug/image/oasis-navigation_img.png)[img.png](browserPlug/image/img.png)

1. 我发布了 火狐和edge 还在审核中， 名字叫：导航助手(Oasis)
2. 压缩包安装：
- 打开 `edge://extensions/` `chrome://extensions/` `about:debugging#/runtime/this-firefox`
- 将[dist](browserPlug/dist)下的压缩包拉进去就好了
