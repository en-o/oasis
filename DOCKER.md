# Oasis Docker 部署指南

## 快速开始

### 1. 使用 Docker Compose（推荐）

```bash
# 复制环境变量配置文件
cp .env.example .env

# 编辑 .env 文件，配置您的环境变量（可选）
# vim .env
# 可选配置：OASIS_DEF_UNAME、OASIS_DEF_PWD、OASIS_DEF_SITE_TITLE

# 构建并启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f oasis-api

# 停止服务
docker-compose down

# 重新构建并启动
docker-compose up -d --build
```

### 2. 使用 Docker 命令

```bash
# 构建镜像（重要：必须从项目根目录执行）
docker build -t tannnn/oasis:latest -f api/Dockerfile .

# 运行容器
docker run -d \
  --name oasis-api \
  -p 1249:1249 \
  -e OASIS_DEF_UNAME=tan \
  -e OASIS_DEF_PWD=123 \
  -e OASIS_DEF_SITE_TITLE=Oasis \
  -v $(pwd)/api/db:/app/db \
  tannnn/oasis:latest

# 查看日志
docker logs -f oasis

# 进入容器
docker exec -it oasis-api sh

# 停止容器
docker stop oasis-api

# 删除容器
docker rm oasis

# 删除镜像
docker rmi tannnn/oasis:latest
```

## 环境变量说明

| 环境变量 | 说明 | 默认值 | 必填 |
|---------|------|--------|------|
| OASIS_DEF_UNAME | 默认用户名 | tan | 否 |
| OASIS_DEF_PWD | 默认密码 | 123 | 否 |
| OASIS_DEF_SITE_TITLE | 网站标题 | Oasis | 否 |
| FILE_MAX_SIZE | 文件上传大小限制 | 500MB | 否 |
| FILE_MAX_REQUEST | 请求大小限制 | 500MB | 否 |

## 访问应用

启动成功后，可以通过以下地址访问：

- **应用首页**: http://localhost:1249
- **API 文档**: http://localhost:1249/doc.html
- **H2 数据库控制台**: http://localhost:1249/h2
  - JDBC URL: `jdbc:h2:file:./api/db/db_oasis`
  - 用户名: `sa`
  - 密码: `sa`

## Dockerfile 构建说明

采用**三阶段构建**，优化镜像大小和构建效率：

### 阶段一：前端构建 (Node 20 Alpine)
```dockerfile
FROM node:20-alpine AS frontend-builder
```
- 复制 `reactWeb` 前端项目
- 执行 `npm install` 安装依赖
- 执行 `npm run build:merged` 构建 React 项目
- 输出静态文件到指定目录

### 阶段二：后端构建 (Maven 3.9 + JDK 17)
```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS backend-builder
```
- 复制前端构建产物到 Spring Boot 静态资源目录
- 复制 Maven 配置和 Java 源代码
- 执行 `mvn clean package` 编译打包
- 生成 jar 包、依赖库和资源文件到 `target/output`

### 阶段三：运行时镜像 (JRE 17 Alpine)
```dockerfile
FROM eclipse-temurin:17-jre-alpine
```
- 仅包含运行时必需的 JRE
- 复制 jar 包、lib 依赖和 resources 资源
- 镜像体积最小化
- 设置默认环境变量
- 暴露 1249 端口

**镜像标签**:
- `maintainer`: tannnn
- `author`: tannnn
- `description`: Oasis Navigation API Service

## 数据持久化

Docker Compose 配置已设置数据卷映射：

```yaml
volumes:
  - ./api/db:/app/db      # H2 数据库文件持久化
  - ./logs:/app/logs      # 日志文件持久化（可选）
```

**数据备份**:
```bash
# 备份数据库
cp -r ./api/db ./backup/db_$(date +%Y%m%d)

# 恢复数据库
docker-compose down
cp -r ./backup/db_20241020 ./api/db
docker-compose up -d
```

## 常见问题

### 1. 端口冲突
如果 1249 端口已被占用，修改 `docker-compose.yml`:
```yaml
ports:
  - "8080:1249"  # 改为其他端口
```

### 2. 构建失败
确保从项目根目录执行构建命令：
```bash
# 正确 ✓
cd /path/to/oasis
docker build -t tannnn/oasis:latest -f api/Dockerfile .

# 错误 ✗
cd /path/to/oasis/api
docker build -t tannnn/oasis:latest .
```

### 3. 数据库初始化
首次启动会自动初始化 H2 数据库，可能需要几秒钟时间。

### 4. 前端静态文件 404
确保前端构建成功，检查容器内是否存在静态文件：
```bash
docker exec -it oasis-api ls -la /app/resources/static
```

### 5. 查看构建日志
```bash
# 构建时查看详细日志
docker build --progress=plain -t tannnn/oasis:latest -f api/Dockerfile .
```

## 高级配置

### 使用外部 MySQL 数据库

1. 修改 Spring Boot 配置文件（通过环境变量或挂载配置文件）
2. 在 `docker-compose.yml` 中添加 MySQL 服务或连接外部 MySQL

### 自定义 JVM 参数

修改 Dockerfile 的 ENTRYPOINT：
```dockerfile
ENTRYPOINT ["java", "-Xms512m", "-Xmx1024m", "-jar", "/app/api.jar"]
```

或在 `docker-compose.yml` 中覆盖：
```yaml
command: ["java", "-Xms512m", "-Xmx1024m", "-jar", "/app/api.jar"]
```

### 多环境部署

创建不同的 `.env` 文件：
- `.env.dev` - 开发环境
- `.env.prod` - 生产环境

启动时指定环境：
```bash
docker-compose --env-file .env.prod up -d
```

## 性能优化建议

1. **构建缓存**: 利用 Docker 层缓存，依赖较少变化的文件先复制
2. **多阶段构建**: 已采用，有效减小最终镜像体积
3. **Alpine 镜像**: 使用 Alpine Linux 基础镜像，体积更小
4. **资源限制**: 在生产环境设置容器资源限制

```yaml
services:
  oasis-api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          memory: 1G
```

## 监控和日志

### 查看实时日志
```bash
docker-compose logs -f --tail=100 oasis-api
```

### 导出日志
```bash
docker logs oasis-api > oasis-api.log 2>&1
```

### 健康检查
可在 `docker-compose.yml` 中添加健康检查：
```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:1249/actuator/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## 清理和维护

```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的容器
docker container prune

# 清理所有未使用的资源
docker system prune -a

# 查看磁盘使用情况
docker system df
```

## 作者信息

- **作者**: tannnn
- **项目**: Oasis Navigation System
- **镜像**: tannnn/oasis
- **仓库**: [GitHub](https://github.com/yourusername/oasis)

## 许可证

请参考项目根目录的 LICENSE 文件
