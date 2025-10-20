# Oasis Docker 部署指南

## 快速开始

### 1. 使用 Docker Compose（推荐）

```bash
# 复制环境变量配置文件
cp .env.example .env

# 编辑 .env 文件，配置您的环境变量
# 可选：修改 OASIS_DEF_UNAME、OASIS_DEF_PWD、OASIS_DEF_SITE_TITLE

# 构建并启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f oasis-api

# 停止服务
docker-compose down
```

### 2. 使用 Docker 命令

```bash
# 构建镜像
cd api
docker build -t tannnn/oasis-api:latest .

# 运行容器
docker run -d \
  --name oasis-api \
  -p 1249:1249 \
  -e OASIS_DEF_UNAME=tan \
  -e OASIS_DEF_PWD=123 \
  -e OASIS_DEF_SITE_TITLE=Oasis \
  -v $(pwd)/db:/app/db \
  tannnn/oasis-api:latest

# 查看日志
docker logs -f oasis-api

# 停止容器
docker stop oasis-api

# 删除容器
docker rm oasis-api
```

## 环境变量说明

| 环境变量 | 说明 | 默认值 |
|---------|------|--------|
| OASIS_DEF_UNAME | 默认用户名 | tan |
| OASIS_DEF_PWD | 默认密码 | 123 |
| OASIS_DEF_SITE_TITLE | 网站标题 | Oasis |
| FILE_MAX_SIZE | 文件上传大小限制 | 500MB |
| FILE_MAX_REQUEST | 请求大小限制 | 500MB |

## 访问应用

启动成功后，可以通过以下地址访问：

- 应用首页: http://localhost:1249
- API 文档: http://localhost:1249/doc.html
- H2 控制台: http://localhost:1249/h2

## 数据持久化

Docker Compose 配置已经设置了数据卷映射：

- `./api/db:/app/db` - H2 数据库文件持久化
- `./logs:/app/logs` - 日志文件持久化（可选）

## 构建说明

Dockerfile 采用多阶段构建：

1. **构建阶段**: 使用 Maven 3.9 + JDK 17 编译项目
2. **运行阶段**: 使用 JRE 17 Alpine 镜像运行应用，减小镜像体积

## 注意事项

1. 默认使用 H2 数据库，数据存储在 `./api/db` 目录
2. 如需使用 MySQL，需要修改 Dockerfile 中的环境变量配置
3. 首次启动可能需要一些时间来初始化数据库
4. 确保 1249 端口未被占用

## 作者信息

- 作者: tannnn
- 镜像: tannnn/oasis-api
