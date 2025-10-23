chcp 65001 >nul
@echo off
REM Docker 镜像构建脚本 - Windows
REM 执行完整的构建流程：本地 Maven 打包 + Docker 镜像构建
REM 用法: docker-build.bat [版本号]
REM 示例: docker-build.bat v1.0.0
REM       docker-build.bat        (默认使用 latest)

setlocal enabledelayedexpansion

REM 获取版本号参数，默认为 latest
set VERSION=%1
if "%VERSION%"=="" set VERSION=latest

echo === Oasis Docker 完整构建脚本 (Windows) ===
echo 构建版本: %VERSION%
echo.

REM 检查是否在项目根目录
if not exist "docker-compose.yml" (
    echo 错误: 请在项目根目录执行此脚本
    exit /b 1
)

REM 检查 Docker 是否安装
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未检测到 Docker，请先安装 Docker
    exit /b 1
)

REM 检查 Maven 是否安装
where mvn >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未检测到 Maven，请先安装 Maven
    echo 安装指南: https://maven.apache.org/install.html
    exit /b 1
)

echo ==========================================
echo 步骤 1/5: 清理环境
echo ==========================================
echo.

echo 清理前端 node_modules（避免构建上下文过大）...
if exist "reactWeb\node_modules" rmdir /s /q "reactWeb\node_modules"
if exist "vueWeb\node_modules" rmdir /s /q "vueWeb\node_modules"
if exist "web\node_modules" rmdir /s /q "web\node_modules"

echo 清理前端构建产物...
if exist "reactWeb\dist" rmdir /s /q "reactWeb\dist"
if exist "vueWeb\dist" rmdir /s /q "vueWeb\dist"
if exist "web\dist" rmdir /s /q "web\dist"

echo 清理 Maven 构建产物...
if exist "api\target" rmdir /s /q "api\target"

echo.
echo ==========================================
echo 步骤 2/5: 执行 Maven 本地打包
echo ==========================================
echo.

cd api

echo 当前 Maven 版本:
call mvn -version
echo.

echo 执行命令: mvn clean package -DskipTests
echo.

REM 执行 Maven 打包
call mvn clean package -DskipTests

if %errorlevel% neq 0 (
    echo.
    echo ❌ Maven 打包失败，构建终止
    cd ..
    exit /b 1
)

echo.
echo ✅ Maven 打包完成
echo.
echo 构建产物:
dir /B target\output

cd ..

echo.
echo ==========================================
echo 步骤 3/5: 验证构建产物
echo ==========================================
echo.

REM 检查必要的文件是否存在
if not exist "api\target\output\api-0.0.3-SNAPSHOT.jar" (
    echo ❌ 错误: 未找到 JAR 文件
    exit /b 1
)

if not exist "api\target\output\lib" (
    echo ❌ 错误: 未找到 lib 目录
    exit /b 1
)

if not exist "api\target\output\resources" (
    echo ❌ 错误: 未找到 resources 目录
    exit /b 1
)

echo ✅ 构建产物验证通过

REM 统计依赖库数量
set lib_count=0
for %%F in (api\target\output\lib\*) do set /a lib_count+=1

REM 统计资源文件数量
set res_count=0
for /D %%D in (api\target\output\resources\*) do set /a res_count+=1
for %%F in (api\target\output\resources\*) do set /a res_count+=1

echo   - JAR 文件: api\target\output\api-0.0.3-SNAPSHOT.jar
echo   - 依赖库数量: !lib_count!
echo   - 资源文件数量: !res_count!

echo.
echo ==========================================
echo 步骤 4/5: 构建 Docker 镜像
echo ==========================================
echo.

echo 执行命令: docker build -t tannnn/oasis:%VERSION% -f api/Dockerfile .
echo.

docker build -t tannnn/oasis:%VERSION% -f api/Dockerfile .

if %errorlevel% neq 0 (
    echo.
    echo ❌ Docker 镜像构建失败
    exit /b 1
)

echo.
echo ==========================================
echo 步骤 5/5: 构建完成
echo ==========================================
echo.

REM 显示镜像信息
docker images tannnn/oasis

echo.
echo ✅ 构建成功完成！
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 下一步操作：
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 1️⃣  直接运行容器:
echo    docker run -d -p 1249:1249 --name oasis tannnn/oasis:%VERSION%
echo.
echo 2️⃣  使用 Docker Compose (推荐):
echo    docker-compose up -d
echo.
echo 3️⃣  查看容器日志:
echo    docker logs -f oasis
echo    # 或
echo    docker-compose logs -f oasis-api
echo.
echo 4️⃣  访问应用:
echo    应用首页: http://localhost:1249
echo    API 文档: http://localhost:1249/doc.html
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

endlocal
