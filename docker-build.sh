#!/bin/bash

# Docker 镜像构建脚本 - Linux/Mac
# 执行完整的构建流程：本地 Maven 打包 + Docker 镜像构建

set -e  # 遇到错误立即退出

echo "=== Oasis Docker 完整构建脚本 (Linux/Mac) ==="
echo ""

# 检查是否在项目根目录
if [ ! -f "docker-compose.yml" ]; then
    echo "错误: 请在项目根目录执行此脚本"
    exit 1
fi

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "错误: 未检测到 Docker，请先安装 Docker"
    exit 1
fi

# 检查 Maven 是否安装
if ! command -v mvn &> /dev/null; then
    echo "错误: 未检测到 Maven，请先安装 Maven"
    echo "安装指南: https://maven.apache.org/install.html"
    exit 1
fi

echo "=========================================="
echo "步骤 1/5: 清理环境"
echo "=========================================="
echo ""

echo "清理前端 node_modules（避免构建上下文过大）..."
rm -rf reactWeb/node_modules
rm -rf vueWeb/node_modules
rm -rf web/node_modules

echo "清理前端构建产物..."
rm -rf reactWeb/dist
rm -rf vueWeb/dist
rm -rf web/dist

echo "清理 Maven 构建产物..."
rm -rf api/target

echo ""
echo "=========================================="
echo "步骤 2/5: 执行 Maven 本地打包"
echo "=========================================="
echo ""

cd api

echo "当前 Maven 版本:"
mvn -version
echo ""

echo "执行命令: mvn clean package -DskipTests"
echo ""

# 执行 Maven 打包
mvn clean package -DskipTests

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Maven 打包失败，构建终止"
    exit 1
fi

echo ""
echo "✅ Maven 打包完成"
echo ""
echo "构建产物:"
ls -lh target/output/

cd ..

echo ""
echo "=========================================="
echo "步骤 3/5: 验证构建产物"
echo "=========================================="
echo ""

# 检查必要的文件是否存在
if [ ! -f "api/target/output/api-0.0.1-SNAPSHOT.jar" ]; then
    echo "❌ 错误: 未找到 JAR 文件"
    exit 1
fi

if [ ! -d "api/target/output/lib" ]; then
    echo "❌ 错误: 未找到 lib 目录"
    exit 1
fi

if [ ! -d "api/target/output/resources" ]; then
    echo "❌ 错误: 未找到 resources 目录"
    exit 1
fi

echo "✅ 构建产物验证通过"
echo "  - JAR 文件: $(ls -lh api/target/output/api-0.0.1-SNAPSHOT.jar | awk '{print $5}')"
echo "  - 依赖库数量: $(ls -1 api/target/output/lib | wc -l)"
echo "  - 资源文件: $(ls -1 api/target/output/resources | wc -l)"

echo ""
echo "=========================================="
echo "步骤 4/5: 构建 Docker 镜像"
echo "=========================================="
echo ""

echo "执行命令: docker build -t tannnn/oasis:latest -f api/Dockerfile ."
echo ""

docker build -t tannnn/oasis:latest -f api/Dockerfile .

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Docker 镜像构建失败"
    exit 1
fi

echo ""
echo "=========================================="
echo "步骤 5/5: 构建完成"
echo "=========================================="
echo ""

# 显示镜像信息
docker images | grep "tannnn/oasis"

echo ""
echo "✅ 构建成功完成！"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "下一步操作："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  直接运行容器:"
echo "   docker run -d -p 1249:1249 --name oasis tannnn/oasis:latest"
echo ""
echo "2️⃣  使用 Docker Compose (推荐):"
echo "   docker-compose up -d"
echo ""
echo "3️⃣  查看容器日志:"
echo "   docker logs -f oasis"
echo "   # 或"
echo "   docker-compose logs -f oasis-api"
echo ""
echo "4️⃣  访问应用:"
echo "   应用首页: http://localhost:1249"
echo "   API 文档: http://localhost:1249/doc.html"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
