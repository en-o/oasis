# 构建阶段
FROM maven:3.9-eclipse-temurin-17 AS builder

# 设置工作目录
WORKDIR /build

# 复制 Maven 配置文件
COPY pom.xml .
COPY .mvn .mvn

# 复制源代码
COPY src ./src

# 复制前端项目（用于合并部署）
COPY ../reactWeb /build/reactWeb

# 构建项目（跳过前端构建，因为可能在 Docker 中构建前端比较复杂）
RUN mvn clean package -Dskip.frontend.build=true -DskipTests

# 运行阶段
FROM eclipse-temurin:17-jre-alpine

# 添加维护者信息
LABEL maintainer="tannnn"
LABEL author="tannnn"
LABEL description="Oasis Navigation API Service"

# 设置工作目录
WORKDIR /app

# 从构建阶段复制生成的文件
COPY --from=builder /build/target/output/api-0.0.1-SNAPSHOT.jar /app/api.jar
COPY --from=builder /build/target/output/lib /app/lib
COPY --from=builder /build/target/output/resources /app/resources

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
