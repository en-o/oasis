#!/bin/bash

# 本地构建脚本 - Linux/Mac
# 在本地环境中执行 Maven 打包，用于后续 Docker 镜像构建

set -e  # 遇到错误立即退出

echo "=== Oasis 本地构建脚本 (Linux/Mac) ==="
echo ""

# 检查是否在项目根目录
if [ ! -f "docker-compose.yml" ]; then
    echo "错误: 请在项目根目录执行此脚本"
    exit 1
fi

# 检查 Maven 是否安装
if ! command -v mvn &> /dev/null; then
    echo "错误: 未检测到 Maven，请先安装 Maven"
    echo "安装指南: https://maven.apache.org/install.html"
    exit 1
fi

# 检查 Java 是否安装
if ! command -v java &> /dev/null; then
    echo "错误: 未检测到 Java，请先安装 JDK 17+"
    exit 1
fi

# 显示 Maven 和 Java 版本
echo "Java 版本:"
java -version
echo ""
echo "Maven 版本:"
mvn -version
echo ""

# 进入 api 目录
cd api

echo "开始执行 Maven 打包..."
echo "命令: mvn clean package -DskipTests"
echo ""

# 执行 Maven 打包（跳过测试）
mvn clean package -DskipTests

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Maven 打包成功！"
    echo ""
    echo "构建产物位置:"
    echo "  - JAR 文件: api/target/output/api-0.0.1-SNAPSHOT.jar"
    echo "  - 依赖库:   api/target/output/lib/"
    echo "  - 资源文件: api/target/output/resources/"
    echo ""
    echo "下一步: 执行 Docker 镜像构建"
    echo "  cd .."
    echo "  ./docker-build.sh"
else
    echo ""
    echo "❌ Maven 打包失败，请检查错误信息"
    exit 1
fi
