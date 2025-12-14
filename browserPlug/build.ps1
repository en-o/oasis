# 导航助手 - 打包脚本
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host '========================================' -ForegroundColor Cyan
Write-Host '  导航助手 - 扩展打包工具' -ForegroundColor Cyan  
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$SOURCE_DIR = Join-Path $SCRIPT_DIR 'google'
$OUTPUT_DIR = Join-Path $SCRIPT_DIR 'dist'

$manifestPath = Join-Path $SOURCE_DIR 'manifest.json'
$manifestContent = Get-Content $manifestPath -Raw | ConvertFrom-Json
$VERSION = $manifestContent.version

$ZIP_NAME = 'oasis-navigation-v' + $VERSION + '.zip'
$OUTPUT_PATH = Join-Path $OUTPUT_DIR $ZIP_NAME

if (-not (Test-Path $OUTPUT_DIR)) {
    New-Item -ItemType Directory -Path $OUTPUT_DIR | Out-Null
}

Write-Host '📦 开始打包...' -ForegroundColor Yellow
Write-Host "   源目录: $SOURCE_DIR"
Write-Host "   版本号: $VERSION"
Write-Host "   输出文件: $ZIP_NAME"
Write-Host ''

if (Test-Path $OUTPUT_PATH) {
    Remove-Item $OUTPUT_PATH -Force
}

# 使用 Windows Shell 压缩（类似右键压缩）
Write-Host '使用 Windows Shell 压缩...'

# 创建空的 ZIP 文件
$zipHeader = [byte[]] @(80, 75, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
[System.IO.File]::WriteAllBytes($OUTPUT_PATH, $zipHeader)

$shellApp = New-Object -ComObject Shell.Application
$zipFile = $shellApp.NameSpace($OUTPUT_PATH)

# 获取源文件夹中的所有项目
$sourceFolder = $shellApp.NameSpace($SOURCE_DIR)

# 复制所有文件到 ZIP
Write-Host '正在复制文件...'
$zipFile.CopyHere($sourceFolder.Items(), 0x14)

# 等待压缩完成
$fileCount = $sourceFolder.Items().Count
do {
    Start-Sleep -Milliseconds 500
    $currentCount = $zipFile.Items().Count
} while ($currentCount -lt $fileCount)

# 额外等待确保写入完成
Start-Sleep -Seconds 2

Write-Host '✅ 打包完成！' -ForegroundColor Green
Write-Host ''
Write-Host "📄 输出文件: $OUTPUT_PATH"
$fileSize = (Get-Item $OUTPUT_PATH).Length
$fileSizeKB = [math]::Round($fileSize / 1KB, 2)
Write-Host "📊 文件大小: $fileSizeKB KB"
Write-Host ''

$TIMESTAMP = Get-Date -Format 'yyyyMMdd_HHmmss'
$BACKUP_NAME = 'oasis-navigation-v' + $VERSION + '_' + $TIMESTAMP + '.zip'
$BACKUP_PATH = Join-Path $OUTPUT_DIR $BACKUP_NAME
Copy-Item $OUTPUT_PATH $BACKUP_PATH
Write-Host "💾 备份文件: $BACKUP_PATH" -ForegroundColor Green
Write-Host ''

Write-Host '========================================' -ForegroundColor Cyan
Write-Host '  打包完成！' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''
Write-Host '📋 下一步操作：'
Write-Host '   1. Chrome 网上应用店：'
Write-Host '      https://chrome.google.com/webstore/devconsole'
Write-Host ''
Write-Host '   2. Edge 加载项商店：'
Write-Host '      https://partner.microsoft.com/dashboard/microsoftedge/overview'
Write-Host ''
Write-Host "   3. 上传文件: $ZIP_NAME"
Write-Host ''

Read-Host '按 Enter 键退出'
