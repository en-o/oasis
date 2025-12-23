@echo off
chcp 65001 >nul
echo ========================================
echo Oasis辅助工具 - 插件打包工具
echo ========================================
echo.

cd /d "%~dp0"

REM 检查icons目录
if not exist "icons\icon16.png" (
    echo [警告] 未找到 icons\icon16.png
    echo 请先添加图标文件到 icons 目录
    echo.
)

REM 清理旧的插件文件（防止数据不对）
echo [0/4] 清理旧文件...
REM 清理 dist 目录
if exist "..\dist\oasisassist-chrome.zip" (
    del /f /q "..\dist\oasisassist-chrome.zip"
    echo [已删除] ..\dist\oasisassist-chrome.zip
)
if exist "..\dist\oasisassist-firefox.zip" (
    del /f /q "..\dist\oasisassist-firefox.zip"
    echo [已删除] ..\dist\oasisassist-firefox.zip
)

REM 清理 reactWeb/public/extensions 目录
if exist "..\..\reactWeb\public\extensions\oasisassist-chrome.zip" (
    del /f /q "..\..\reactWeb\public\extensions\oasisassist-chrome.zip"
    echo [已删除] reactWeb\public\extensions\oasisassist-chrome.zip
)
if exist "..\..\reactWeb\public\extensions\oasisassist-firefox.zip" (
    del /f /q "..\..\reactWeb\public\extensions\oasisassist-firefox.zip"
    echo [已删除] reactWeb\public\extensions\oasisassist-firefox.zip
)
echo [完成] 旧文件已清理
echo.

REM 创建输出目录
if not exist "..\dist" mkdir "..\dist"

echo [1/4] 打包 Chrome/Edge 版本...
REM 创建临时目录
if exist "temp-chrome" rd /s /q temp-chrome
mkdir temp-chrome

REM 复制文件
xcopy /E /I /Y icons temp-chrome\icons >nul
copy /Y manifest.json temp-chrome\ >nul
copy /Y background.js temp-chrome\ >nul
copy /Y popup.html temp-chrome\ >nul
copy /Y popup.js temp-chrome\ >nul
copy /Y add.html temp-chrome\ >nul
copy /Y add.js temp-chrome\ >nul
copy /Y login.html temp-chrome\ >nul
copy /Y login.js temp-chrome\ >nul
copy /Y options.html temp-chrome\ >nul
copy /Y options.js temp-chrome\ >nul

REM 使用PowerShell打包
powershell -Command "Compress-Archive -Path 'temp-chrome\*' -DestinationPath '..\dist\oasisassist-chrome.zip' -Force"
echo [完成] Chrome/Edge 版本已打包到 ..\dist\oasisassist-chrome.zip

echo.
echo [2/4] 打包 Firefox 版本...
REM 创建临时目录
if exist "temp-firefox" rd /s /q temp-firefox
mkdir temp-firefox

REM 复制文件
xcopy /E /I /Y icons temp-firefox\icons >nul
copy /Y manifest.firefox.json temp-firefox\manifest.json >nul
copy /Y background.js temp-firefox\ >nul
copy /Y popup.html temp-firefox\ >nul
copy /Y popup.js temp-firefox\ >nul
copy /Y add.html temp-firefox\ >nul
copy /Y add.js temp-firefox\ >nul
copy /Y login.html temp-firefox\ >nul
copy /Y login.js temp-firefox\ >nul
copy /Y options.html temp-firefox\ >nul
copy /Y options.js temp-firefox\ >nul

REM 使用PowerShell打包
powershell -Command "Compress-Archive -Path 'temp-firefox\*' -DestinationPath '..\dist\oasisassist-firefox.zip' -Force"
echo [完成] Firefox 版本已打包到 ..\dist\oasisassist-firefox.zip

echo.
echo [3/4] 复制到reactWeb的public目录...
if not exist "..\..\reactWeb\public\extensions" mkdir "..\..\reactWeb\public\extensions"
copy /Y ..\dist\oasisassist-chrome.zip ..\..\reactWeb\public\extensions\ >nul
copy /Y ..\dist\oasisassist-firefox.zip ..\..\reactWeb\public\extensions\ >nul
echo [完成] 插件已复制到 reactWeb\public\extensions

echo.
echo [4/4] 清理临时目录...
REM 清理临时目录
rd /s /q temp-chrome
rd /s /q temp-firefox
echo [完成] 临时目录已清理

echo.
echo ========================================
echo 打包完成！
echo ========================================
echo.
echo Chrome/Edge 版本: browserPlug\dist\oasisassist-chrome.zip
echo Firefox 版本: browserPlug\dist\oasisassist-firefox.zip
echo.
echo 已复制到: reactWeb\public\extensions
echo.
pause
