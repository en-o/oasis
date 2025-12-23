# 导航助手 - 打包脚本（支持 Chrome 和 Firefox）
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host '========================================' -ForegroundColor Cyan
Write-Host '  导航助手 - 扩展打包工具' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$SOURCE_DIR = Join-Path $SCRIPT_DIR 'oasis-navigation'
$OUTPUT_DIR = Join-Path $SCRIPT_DIR 'dist'

# 获取版本号
$manifestPath = Join-Path $SOURCE_DIR 'manifest.json'
$manifestContent = Get-Content $manifestPath -Raw | ConvertFrom-Json
$VERSION = $manifestContent.version

if (-not (Test-Path $OUTPUT_DIR)) {
    New-Item -ItemType Directory -Path $OUTPUT_DIR | Out-Null
}

Write-Host '选择打包目标：'
Write-Host '  1. Chrome/Edge (默认)'
Write-Host '  2. Firefox'
Write-Host '  3. 两者都打包'
Write-Host ''
$choice = Read-Host '请输入选项 (1-3，直接回车选择1)'

if ([string]::IsNullOrWhiteSpace($choice)) {
    $choice = '1'
}

function Create-ZipPackage {
    param(
        [string]$SourceDir,
        [string]$OutputPath,
        [string]$ManifestFile = 'manifest.json'
    )

    if (Test-Path $OutputPath) {
        Remove-Item $OutputPath -Force
    }

    Write-Host '使用 Windows Shell 压缩...'

    # 创建空的 ZIP 文件
    $zipHeader = [byte[]] @(80, 75, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
    [System.IO.File]::WriteAllBytes($OutputPath, $zipHeader)

    $shellApp = New-Object -ComObject Shell.Application
    $zipFile = $shellApp.NameSpace($OutputPath)
    $sourceFolder = $shellApp.NameSpace($SourceDir)

    Write-Host '正在复制文件...'
    $zipFile.CopyHere($sourceFolder.Items(), 0x14)

    $fileCount = $sourceFolder.Items().Count
    do {
        Start-Sleep -Milliseconds 500
        $currentCount = $zipFile.Items().Count
    } while ($currentCount -lt $fileCount)

    Start-Sleep -Seconds 2

    Write-Host '✅ 打包完成！' -ForegroundColor Green
    $fileSize = (Get-Item $OutputPath).Length
    $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
    Write-Host "📊 文件大小: $fileSizeKB KB"
}

# Chrome/Edge 打包
if ($choice -eq '1' -or $choice -eq '3') {
    Write-Host ''
    Write-Host '========================================' -ForegroundColor Yellow
    Write-Host '  打包 Chrome/Edge 版本' -ForegroundColor Yellow
    Write-Host '========================================' -ForegroundColor Yellow
    Write-Host ''

    $chromeZipName = 'oasis-navigation-chrome-v' + $VERSION + '.zip'
    $chromeOutputPath = Join-Path $OUTPUT_DIR $chromeZipName

    Write-Host "   源目录: $SOURCE_DIR"
    Write-Host "   版本号: $VERSION"
    Write-Host "   输出文件: $chromeZipName"
    Write-Host ''

    Create-ZipPackage -SourceDir $SOURCE_DIR -OutputPath $chromeOutputPath

    Write-Host "📄 输出文件: $chromeOutputPath"
    Write-Host ''
}

# Firefox 打包
if ($choice -eq '2' -or $choice -eq '3') {
    Write-Host ''
    Write-Host '========================================' -ForegroundColor Yellow
    Write-Host '  打包 Firefox 版本' -ForegroundColor Yellow
    Write-Host '========================================' -ForegroundColor Yellow
    Write-Host ''

    $firefoxZipName = 'oasis-navigation-firefox-v' + $VERSION + '.zip'
    $firefoxOutputPath = Join-Path $OUTPUT_DIR $firefoxZipName

    Write-Host "   源目录: $SOURCE_DIR"
    Write-Host "   版本号: $VERSION"
    Write-Host "   输出文件: $firefoxZipName"
    Write-Host ''

    # 临时替换 manifest.json
    $manifestPath = Join-Path $SOURCE_DIR 'manifest.json'
    $manifestFirefoxPath = Join-Path $SOURCE_DIR 'manifest.firefox.json'
    $manifestBackupPath = Join-Path $SOURCE_DIR 'manifest.backup.json'

    Copy-Item $manifestPath $manifestBackupPath -Force
    Copy-Item $manifestFirefoxPath $manifestPath -Force

    Create-ZipPackage -SourceDir $SOURCE_DIR -OutputPath $firefoxOutputPath

    # 恢复 manifest.json
    Copy-Item $manifestBackupPath $manifestPath -Force
    Remove-Item $manifestBackupPath -Force

    Write-Host "📄 输出文件: $firefoxOutputPath"
    Write-Host ''
}

Write-Host '========================================' -ForegroundColor Cyan
Write-Host '  所有打包完成！' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''
Write-Host '📋 下一步操作：'
Write-Host '   1. Chrome 网上应用店：'
Write-Host '      https://chrome.google.com/webstore/devconsole'
Write-Host '      上传: oasis-navigation-chrome-v' + $VERSION + '.zip'
Write-Host ''
Write-Host '   2. Edge 加载项商店：'
Write-Host '      https://partner.microsoft.com/dashboard/microsoftedge/overview'
Write-Host '      上传: oasis-navigation-chrome-v' + $VERSION + '.zip'
Write-Host ''
Write-Host '   3. Firefox 附加组件：'
Write-Host '      https://addons.mozilla.org/developers/'
Write-Host '      上传: oasis-navigation-firefox-v' + $VERSION + '.zip'
Write-Host ''

Read-Host '按 Enter 键退出'
