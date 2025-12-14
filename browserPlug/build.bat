@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 导航助手 - 打包脚本 (Windows)
REM 用于打包 Chrome/Edge 扩展

echo ========================================
echo   导航助手 - 扩展打包工具
echo ========================================
echo.

REM 设置变量
set "SCRIPT_DIR=%~dp0"
set "SOURCE_DIR=%SCRIPT_DIR%google"
set "OUTPUT_DIR=%SCRIPT_DIR%dist"

REM 获取版本号
for /f "tokens=2 delims=:, " %%a in ('findstr /C:"\"version\"" "%SOURCE_DIR%\manifest.json"') do (
    set VERSION=%%a
    set VERSION=!VERSION:"=!
)

set "ZIP_NAME=oasis-navigation-v%VERSION%.zip"

REM 创建输出目录
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

echo 📦 开始打包...
echo    源目录: %SOURCE_DIR%
echo    版本号: %VERSION%
echo    输出文件: %ZIP_NAME%
echo.

REM 优先使用 PowerShell 脚本（最可靠）
if exist "%SCRIPT_DIR%build.ps1" (
    echo 使用 PowerShell 脚本打包...
    powershell.exe -ExecutionPolicy Bypass -File "%SCRIPT_DIR%build.ps1"
    goto :end
)

REM 检查是否安装了 7-Zip
where 7z >nul 2>&1
if %errorlevel% equ 0 (
    REM 使用 7-Zip 打包
    cd /d "%SOURCE_DIR%"
    7z a -tzip "%OUTPUT_DIR%\%ZIP_NAME%" * -xr!.git* -xr!.DS_Store -xr!Thumbs.db -xr!*.bak >nul
    if %errorlevel% equ 0 (
        echo ✅ 打包完成！使用 7-Zip
        goto :success
    )
)

REM 尝试使用 Windows tar 命令（Windows 10+）
where tar >nul 2>&1
if %errorlevel% equ 0 (
    cd /d "%SOURCE_DIR%"
    tar -a -c -f "%OUTPUT_DIR%\%ZIP_NAME%" *
    if %errorlevel% equ 0 (
        echo ✅ 打包完成！使用 Windows tar
        goto :success
    )
)

REM 所有方法都失败
echo ❌ 打包失败
echo.
echo 💡 解决方案：
echo    方法1: 在 PowerShell 中运行此脚本
echo           powershell -ExecutionPolicy Bypass -File build.ps1
echo.
echo    方法2: 安装 7-Zip
echo           下载地址: https://www.7-zip.org/
echo.
echo    方法3: 手动压缩
echo           右键 google 文件夹内的所有文件 → 发送到 → 压缩文件夹
echo.
pause
exit /b 1

:success
echo.
echo 📄 输出文件: %OUTPUT_DIR%\%ZIP_NAME%
for %%A in ("%OUTPUT_DIR%\%ZIP_NAME%") do echo 📊 文件大小: %%~zA 字节
echo.

REM 创建带时间戳的备份
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set "BACKUP_NAME=oasis-navigation-v%VERSION%_%TIMESTAMP%.zip"
copy "%OUTPUT_DIR%\%ZIP_NAME%" "%OUTPUT_DIR%\%BACKUP_NAME%" >nul
echo 💾 备份文件: %OUTPUT_DIR%\%BACKUP_NAME%
echo.

echo ========================================
echo   打包完成！
echo ========================================
echo.
echo 📋 下一步操作：
echo    1. Chrome 网上应用店：
echo       https://chrome.google.com/webstore/devconsole
echo.
echo    2. Edge 加载项商店：
echo       https://partner.microsoft.com/dashboard/microsoftedge/overview
echo.
echo    3. 上传文件: %ZIP_NAME%
echo.

:end
pause
