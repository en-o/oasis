#!/bin/bash

# 导航助手 - 打包脚本
# 用于打包 Chrome/Edge 扩展

set -e

echo "========================================"
echo "  导航助手 - 扩展打包工具"
echo "========================================"
echo ""

# 设置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$SCRIPT_DIR/google"
OUTPUT_DIR="$SCRIPT_DIR/dist"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
VERSION=$(grep -o '"version": "[^"]*"' "$SOURCE_DIR/manifest.json" | cut -d'"' -f4)
ZIP_NAME="oasis-navigation-v${VERSION}.zip"

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

echo "📦 开始打包..."
echo "   源目录: $SOURCE_DIR"
echo "   版本号: $VERSION"
echo "   输出文件: $ZIP_NAME"
echo ""

# 进入源目录
cd "$SOURCE_DIR"

# 打包文件（排除不必要的文件）
zip -r "$OUTPUT_DIR/$ZIP_NAME" . \
  -x "*.git*" \
  -x "*.DS_Store" \
  -x "*Thumbs.db" \
  -x "*.bak" \
  -x "*~" \
  > /dev/null

echo "✅ 打包完成！"
echo ""
echo "📄 输出文件: $OUTPUT_DIR/$ZIP_NAME"
echo "📊 文件大小: $(du -h "$OUTPUT_DIR/$ZIP_NAME" | cut -f1)"
echo ""

# 同时创建带时间戳的备份
BACKUP_NAME="oasis-navigation-v${VERSION}_${TIMESTAMP}.zip"
cp "$OUTPUT_DIR/$ZIP_NAME" "$OUTPUT_DIR/$BACKUP_NAME"
echo "💾 备份文件: $OUTPUT_DIR/$BACKUP_NAME"
echo ""

echo "========================================"
echo "  打包完成！"
echo "========================================"
echo ""
echo "📋 下一步操作："
echo "   1. Chrome 网上应用店："
echo "      https://chrome.google.com/webstore/devconsole"
echo ""
echo "   2. Edge 加载项商店："
echo "      https://partner.microsoft.com/dashboard/microsoftedge/overview"
echo ""
echo "   3. 上传文件: $ZIP_NAME"
echo ""
