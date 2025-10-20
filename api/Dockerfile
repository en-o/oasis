# 前端构建阶段
FROM node:20-alpine AS frontend-builder

# 设置工作目录
WORKDIR /frontend

# 复制前端项目文件
COPY reactWeb/package*.json ./

# 安装依赖
RUN npm install

# 复制前端源代码
COPY reactWeb/ ./

# 创建构建输出目录（因为 vite.config.ts 在 production 模式下会输出到 ../api/src/main/resources/static）
RUN mkdir -p ../api/src/main/resources/static

# 构建前端项目（生产模式）
RUN npm run build:merged

# 后端构建阶段
FROM maven:3.9-eclipse-temurin-17 AS backend-builder

# 设置工作目录
WORKDIR /build

# 复制 Maven 配置文件
COPY api/pom.xml .
COPY api/.mvn .mvn

# 复制源代码
COPY api/src ./src

# 从前端构建阶段复制构建产物到 Spring Boot 静态资源目录
COPY --from=frontend-builder /api/src/main/resources/static ./src/main/resources/static

# 构建项目（跳过前端构建，因为已经在上一阶段完成）
RUN mvn clean package -Dskip.frontend.build=true -DskipTests

# 运行阶段
FROM eclipse-temurin:17-jre-alpine

# 添加维护者信息
LABEL maintainer="tannnn"
LABEL author="tannnn"
LABEL description="Oasis Navigation API Service"

# 设置工作目录
WORKDIR /app

# 从后端构建阶段复制生成的文件
COPY --from=backend-builder /build/target/output/api-0.0.1-SNAPSHOT.jar /app/api.jar
COPY --from=backend-builder /build/target/output/lib /app/lib
COPY --from=backend-builder /build/target/output/resources /app/resources

# 创建数据目录
RUN mkdir -p /app/db

# 暴露应用端口
EXPOSE 1249

# 设置环境变量（默认值）
ENV OASIS_DEF_PWD=123
ENV OASIS_DEF_UNAME=tan
ENV OASIS_DEF_SITE_TITLE=Oasis

# 启动应用
ENTRYPOINT ["java", "-jar", "/app/api.jar"]
