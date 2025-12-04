# Oasis · 专属绿洲
在信息纷繁复杂的数字荒漠中，您需要一片宁静、高效且专属于自我的空间。

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
  tannnn/oasis:0.0.3.5
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
> - 当前最新：0.0.3.5
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
