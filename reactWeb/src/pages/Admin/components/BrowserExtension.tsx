import React from 'react';
import { Button, Card, Row, Col, App, Modal } from 'antd';
import { Download } from 'lucide-react';

const BrowserExtension: React.FC = () => {
  const { message } = App.useApp();

  // 处理插件下载
  const handleDownloadExtension = (browser: 'chrome' | 'firefox') => {
    const fileName = browser === 'chrome' ? 'oasisassist-chrome.zip' : 'oasisassist-firefox.zip';
    // 获取基础路径，确保正确处理 VITE_BASE_PATH
    const basePath = import.meta.env.VITE_BASE_PATH || '/';
    const normalizedBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    const downloadUrl = `${normalizedBasePath}/extensions/${fileName}`;

    // 创建隐藏的下载链接
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success(`开始下载 ${browser === 'chrome' ? 'Chrome/Edge' : 'Firefox'} 版本插件`);

    // 延迟后打开插件管理页面（给用户时间看到下载提示）
    setTimeout(() => {
      openExtensionPage(browser);
    }, 1500);
  };

  // 打开浏览器插件管理页面
  const openExtensionPage = (browser: 'chrome' | 'firefox') => {
    let extensionUrl = '';
    let browserName = '';

    if (browser === 'chrome') {
      // 检测是 Chrome 还是 Edge
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('edg/')) {
        browserName = 'Edge';
        extensionUrl = 'edge://extensions/';
      } else {
        browserName = 'Chrome';
        extensionUrl = 'chrome://extensions/';
      }
    } else {
      browserName = 'Firefox';
      extensionUrl = 'about:debugging#/runtime/this-firefox';
    }

    // 尝试复制到剪贴板
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(extensionUrl).then(() => {
        message.success({
          content: `✅ 已将 ${browserName} 插件管理地址复制到剪贴板！请粘贴到地址栏访问`,
          duration: 3,
        });
      }).catch(() => {
        // 复制失败，显示弹窗
        showExtensionGuide(extensionUrl, browser, browserName);
      });
    } else {
      // 不支持剪贴板，显示弹窗
      showExtensionGuide(extensionUrl, browser, browserName);
    }

    // 延迟显示详细引导
    setTimeout(() => {
      showExtensionGuide(extensionUrl, browser, browserName);
    }, 500);
  };

  // 显示插件安装引导
  const showExtensionGuide = (extensionUrl: string, browser: 'chrome' | 'firefox', browserName: string) => {
    const steps = browser === 'firefox'
      ? [
          '1. 在 Firefox 地址栏输入下方地址',
          '2. 点击"临时加载附加组件"按钮',
          '3. ⚡ 快捷方式：直接选择 ZIP 压缩包（推荐，无需解压）',
          '   或 📂 传统方式：解压后选择其中的 manifest.json 文件'
        ]
      : [
          '1. 在浏览器地址栏输入下方地址',
          '2. 开启"开发者模式"开关',
          '3. ⚡ 快捷方式：直接拖拽 ZIP 压缩包到页面（推荐，无需解压）',
          '   或 📂 传统方式：解压后点击"加载已解压的扩展程序"选择文件夹'
        ];

    Modal.info({
      title: (
        <div className="flex items-center gap-2">
          <span className="text-2xl">{browser === 'firefox' ? '🦊' : '🌐'}</span>
          <span>{browserName} 插件安装步骤</span>
        </div>
      ),
      width: 650,
      content: (
        <div className="py-4">
          <div className="mb-4 space-y-2">
            {steps.map((step, index) => (
              <p key={index} className="text-gray-700 leading-relaxed">{step}</p>
            ))}
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-2">📋 插件管理页面地址（已复制到剪贴板）：</p>
                <code className="text-sm text-blue-700 font-mono break-all select-all bg-white px-3 py-2 rounded block">
                  {extensionUrl}
                </code>
              </div>
              <Button
                size="small"
                type="primary"
                onClick={() => {
                  navigator.clipboard.writeText(extensionUrl).then(() => {
                    message.success('已复制到剪贴板');
                  });
                }}
              >
                复制
              </Button>
            </div>
          </div>
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">💡 操作提示：</span>
              {browser === 'firefox'
                ? ' 由于浏览器安全限制，无法自动打开，请手动复制上方地址到 Firefox 地址栏访问。'
                : ' 请在浏览器地址栏按 Ctrl+V (Mac: Cmd+V) 粘贴并访问上方地址。'
              }
            </p>
          </div>
        </div>
      ),
      okText: '我知道了',
      centered: true,
    });
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">浏览器插件</h2>
        <p className="text-gray-600">
          下载 Oasis 导航助手插件，快速添加网页到您的导航系统
        </p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer h-full"
            style={{ borderColor: '#1890ff', borderWidth: '2px' }}
          >
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  {/* Chrome/Edge 图标 - 使用简单的文字图标 */}
                  <span className="text-3xl">🌐</span>
                </div>
              </div>
              <h3 className="text-xl font-medium mb-2">Chrome / Edge</h3>
              <p className="text-sm text-gray-600 mb-4 min-h-[40px]">
                支持 Chrome 和 Microsoft Edge 浏览器
              </p>
              <Button
                type="primary"
                size="large"
                icon={<Download className="w-4 h-4" />}
                onClick={() => handleDownloadExtension('chrome')}
                block
              >
                下载 Chrome 版本
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer h-full"
            style={{ borderColor: '#ff7139', borderWidth: '2px' }}
          >
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  {/* Firefox 图标 - 使用简单的文字图标 */}
                  <span className="text-3xl">🦊</span>
                </div>
              </div>
              <h3 className="text-xl font-medium mb-2">Firefox</h3>
              <p className="text-sm text-gray-600 mb-4 min-h-[40px]">
                支持 Mozilla Firefox 浏览器
              </p>
              <Button
                type="primary"
                size="large"
                icon={<Download className="w-4 h-4" />}
                onClick={() => handleDownloadExtension('firefox')}
                block
                style={{ backgroundColor: '#ff7139', borderColor: '#ff7139' }}
              >
                下载 Firefox 版本
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 功能特性 */}
      <Card className="mt-6" style={{ backgroundColor: '#f0f5ff', borderColor: '#adc6ff' }}>
        <h3 className="text-lg font-medium mb-4">功能特性</h3>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span className="text-gray-700">右键菜单快速添加网页</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span className="text-gray-700">自动填充页面标题和URL</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span className="text-gray-700">支持自定义图标（URL或上传）</span>
              </li>
            </ul>
          </Col>
          <Col xs={24} md={12}>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span className="text-gray-700">完整的表单功能</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span className="text-gray-700">可配置API服务器地址</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span className="text-gray-700">支持分类、排序等设置</span>
              </li>
            </ul>
          </Col>
        </Row>
      </Card>

      {/* 安装说明 */}
      <Card className="mt-6">
        <h3 className="text-lg font-medium mb-4">安装说明</h3>

        <div className="mb-6">
          <h4 className="font-medium text-blue-600 mb-2">Chrome / Edge 安装步骤：</h4>

          <div className="mb-4">
            <p className="text-sm font-semibold text-green-600 mb-2">⚡ 快捷方式（推荐）：</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-2">
              <li>打开浏览器扩展程序管理页面：
                <ul className="list-disc list-inside ml-6 mt-1 text-sm text-gray-600">
                  <li>Chrome: 地址栏输入 <code className="bg-gray-100 px-2 py-0.5 rounded">chrome://extensions/</code></li>
                  <li>Edge: 地址栏输入 <code className="bg-gray-100 px-2 py-0.5 rounded">edge://extensions/</code></li>
                </ul>
              </li>
              <li>开启右上角的"开发者模式"开关</li>
              <li>
                <span className="font-semibold text-green-600">直接将下载的 ZIP 压缩包拖拽到页面中</span>
                <span className="text-sm text-gray-500 ml-2">（无需解压）</span>
              </li>
            </ol>
          </div>

          <div>
            <p className="text-sm font-semibold text-blue-600 mb-2">📂 传统方式：</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-2">
              <li>下载插件压缩包并解压到任意目录</li>
              <li>打开浏览器扩展程序管理页面：
                <ul className="list-disc list-inside ml-6 mt-1 text-sm text-gray-600">
                  <li>Chrome: 地址栏输入 <code className="bg-gray-100 px-2 py-0.5 rounded">chrome://extensions/</code></li>
                  <li>Edge: 地址栏输入 <code className="bg-gray-100 px-2 py-0.5 rounded">edge://extensions/</code></li>
                </ul>
              </li>
              <li>开启右上角的"开发者模式"开关</li>
              <li>点击"加载已解压的扩展程序"按钮</li>
              <li>选择解压后的文件夹</li>
            </ol>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-medium mb-2" style={{ color: '#ff7139' }}>Firefox 安装步骤：</h4>

          <div className="mb-4">
            <p className="text-sm font-semibold text-green-600 mb-2">⚡ 快捷方式（推荐）：</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-2">
              <li>在地址栏输入 <code className="bg-gray-100 px-2 py-0.5 rounded">about:debugging#/runtime/this-firefox</code></li>
              <li>点击"临时加载附加组件"按钮</li>
              <li>
                <span className="font-semibold text-green-600">直接选择下载的 ZIP 压缩包</span>
                <span className="text-sm text-gray-500 ml-2">（无需解压）</span>
              </li>
            </ol>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: '#ff7139' }}>📂 传统方式：</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-2">
              <li>下载插件压缩包并解压到任意目录</li>
              <li>在地址栏输入 <code className="bg-gray-100 px-2 py-0.5 rounded">about:debugging#/runtime/this-firefox</code></li>
              <li>点击"临时加载附加组件"按钮</li>
              <li>选择解压目录中的 <code className="bg-gray-100 px-2 py-0.5 rounded">manifest.json</code> 文件</li>
            </ol>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded p-3 mt-3">
            <p className="text-sm text-orange-700">
              <span className="font-semibold">⚠️ 注意：</span>
              临时加载的插件在浏览器重启后会失效，需要重新加载。
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <h4 className="font-medium text-yellow-800 mb-2">使用前配置：</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 ml-2">
            <li>安装插件后，点击浏览器工具栏上的插件图标</li>
            <li>点击"设置"按钮</li>
            <li>
              输入 API 服务器地址
              <div className="mt-2 ml-4 space-y-2">
                <div className="bg-white p-3 rounded border border-gray-300">
                  <p className="text-xs font-semibold text-blue-700 mb-2">💡 快速获取 API 地址方法：</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600 ml-2">
                    <li>在当前 Oasis 管理页面按 <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">F12</kbd> 打开开发者工具</li>
                    <li>切换到 Network（网络）标签页</li>
                    <li>刷新页面或点击任意菜单，查看接口请求</li>
                    <li>找到任意以 <code className="bg-blue-50 px-1 py-0.5 rounded text-blue-700">/api/</code> 开头的接口</li>
                    <li>复制接口 URL 的前缀部分作为 API 地址</li>
                  </ol>
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <p className="text-xs text-gray-600 mb-1">示例：</p>
                    <p className="text-xs">
                      接口地址：<code className="text-blue-600">http://localhost:1249/api/navCategory/lists</code>
                    </p>
                    <p className="text-xs mt-1">
                      插件配置：<code className="text-green-600 font-semibold">http://localhost:1249/api</code>
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 ml-4">
                  或直接输入：<code className="bg-white px-2 py-0.5 rounded">http://localhost:1249</code>（本地开发）
                </p>
              </div>
            </li>
            <li>点击"测试连接"确认连接成功</li>
            <li>保存设置</li>
          </ol>
        </div>
      </Card>

      {/* 使用方法 */}
      <Card className="mt-6" style={{ backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
        <h3 className="text-lg font-medium mb-4 text-green-700">使用方法</h3>
        <div className="space-y-3 text-gray-700">
          <div>
            <span className="font-medium text-green-600">方式1：</span> 在任意网页上右键点击，选择"添加到Oasis导航"
          </div>
          <div>
            <span className="font-medium text-green-600">方式2：</span> 点击浏览器工具栏上的插件图标，点击"添加当前页面"按钮
          </div>
          <div className="text-sm text-gray-600 mt-3">
            提示：添加时会自动填充页面标题和URL，您可以根据需要修改或补充其他信息
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BrowserExtension;
