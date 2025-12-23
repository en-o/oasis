@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 导航助手 - 打包脚本 (Windows)
REM 用于打包 Chrome/Edge/Firefox 扩展

echo ========================================
echo   导航助手 - 扩展打包工具
echo ========================================
echo.

REM 设置变量
set "SCRIPT_DIR=%~dp0"

REM 优先使用 oasis_navigation_build-all.ps1（支持 Chrome 和 Firefox）
if exist "%SCRIPT_DIR%oasis_navigation_build-all.ps1" (
    echo 使用 oasis_navigation_build-all.ps1 打包...
    powershell.exe -ExecutionPolicy Bypass -File "%SCRIPT_DIR%oasis_navigation_build-all.ps1"
    goto :end
)

REM 降级到 oasis_navigation_build.ps1（仅 Chrome）
if exist "%SCRIPT_DIR%build.ps1" (
    echo 使用 oasis_navigation_build.ps1 打包（仅 Chrome）...
    powershell.exe -ExecutionPolicy Bypass -File "%SCRIPT_DIR%oasis_navigation_build.ps1"
    goto :end
)

echo ❌ 未找到打包脚本
echo.
echo 💡 解决方案：
echo    请确保 oasis_navigation_build-all.ps1 或 oasis_navigation_build.ps1 存在
echo.
pause
exit /b 1

:end
