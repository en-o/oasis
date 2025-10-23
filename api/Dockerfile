# ============================================
# Oasis Docker 镜像构建文件
# ============================================
# 构建方式：两阶段构建（前端构建 + 运行时）
#
# 【重要】构建前提条件:
# 1. 必须先在本地执行 Maven 打包
#    Linux/Mac: ./build-local.sh
#    Windows:   build-local.bat
# 2. 确保 api/target/output/ 目录包含以下文件：
#    - api-*.jar（使用通配符匹配版本号)
#    - lib/（所有依赖 jar）
#    - resources/（所有资源文件）
#
# 构建命令（从项目根目录执行）:
#   docker build -t tannnn/oasis:latest -f api/Dockerfile .
#
# 或使用构建脚本（推荐）:
#   Linux/Mac: ./docker-build.sh
#   Windows:   docker-build.bat
# ============================================

# ============================================
# 阶段 1: 前端构建
# ============================================
FROM node:20-alpine AS frontend-builder

# 设置工作目录
WORKDIR /frontend

# 复制前端项目 package 文件
COPY reactWeb/package*.json ./

# 安装依赖
RUN npm install

# 复制前端源代码
COPY reactWeb/ ./

# 创建构建输出目录（用于 Vite 在 production 模式下输出）
RUN mkdir -p ../api/target/output/resources/static

# 构建前端项目（生产模式，输出到指定目录）
RUN npm run build:merged

# ============================================
# 阶段 2: 运行时镜像
# ============================================
FROM eclipse-temurin:17-jre-alpine

# 添加维护者信息
LABEL maintainer="tannnn"
LABEL author="tannnn"
LABEL description="Oasis Navigation API Service"
LABEL build.method="local-build"

# 设置工作目录
WORKDIR /app

# 从前端构建阶段复制前端静态文件到后端资源目录
COPY --from=frontend-builder /api/target/output/resources/static /tmp/frontend-static/

# 从本地构建产物复制文件（使用通配符匹配版本号）
COPY api/target/output/api-*.jar /app/api.jar
COPY api/target/output/lib /app/lib
COPY api/target/output/resources /app/resources

# 将前端静态文件移动到正确位置
RUN cp -r /tmp/frontend-static/* /app/resources/static/ 2>/dev/null || mkdir -p /app/resources/static && \
    rm -rf /tmp/frontend-static

# 创建数据目录
RUN mkdir -p /app/db

# 暴露应用端口
EXPOSE 1249

# 设置环境变量（默认值）
ENV OASIS_DEF_PWD=123
ENV OASIS_DEF_UNAME=tan
ENV OASIS_DEF_SITE_TITLE=Oasis

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:1249/actuator/health || exit 1

# 启动应用
ENTRYPOINT ["java", "-jar", "/app/api.jar"]
