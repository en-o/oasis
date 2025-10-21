@echo off
REM 本地构建脚本 - Windows
REM 在本地环境中执行 Maven 打包，用于后续 Docker 镜像构建

setlocal enabledelayedexpansion

echo === Oasis 本地构建脚本 (Windows) ===
echo.

REM 检查是否在项目根目录
if not exist "docker-compose.yml" (
    echo 错误: 请在项目根目录执行此脚本
    exit /b 1
)

REM 检查 Maven 是否安装
where mvn >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未检测到 Maven，请先安装 Maven
    echo 安装指南: https://maven.apache.org/install.html
    exit /b 1
)

REM 检查 Java 是否安装
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未检测到 Java，请先安装 JDK 17+
    exit /b 1
)

REM 显示 Maven 和 Java 版本
echo Java 版本:
java -version
echo.
echo Maven 版本:
mvn -version
echo.

REM 进入 api 目录
cd api

echo 开始执行 Maven 打包...
echo 命令: mvn clean package -DskipTests
echo.

REM 执行 Maven 打包（跳过测试）
call mvn clean package -DskipTests

if %errorlevel% equ 0 (
    echo.
    echo ✅ Maven 打包成功！
    echo.
    echo 构建产物位置:
    echo   - JAR 文件: api\target\output\api-0.0.1-SNAPSHOT.jar
    echo   - 依赖库:   api\target\output\lib\
    echo   - 资源文件: api\target\output\resources\
    echo.
    echo 下一步: 执行 Docker 镜像构建
    echo   cd ..
    echo   docker-build.bat
) else (
    echo.
    echo ❌ Maven 打包失败，请检查错误信息
    exit /b 1
)

endlocal
