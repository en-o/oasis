import React from 'react';
import { Button, Card, Row, Col, App } from 'antd';
import { Download, Chrome } from 'lucide-react';

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

    if (browser === 'chrome') {
      // 检测是 Chrome 还是 Edge
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('edg/')) {
        // Edge 浏览器
        extensionUrl = 'edge://extensions/';
      } else {
        // Chrome 浏览器
        extensionUrl = 'chrome://extensions/';
      }
    } else {
      // Firefox 浏览器
      extensionUrl = 'about:debugging#/runtime/this-firefox';
    }

    // 尝试在新标签页打开插件管理页面
    const newWindow = window.open(extensionUrl, '_blank');

    // 如果无法打开（某些浏览器不允许通过 JS 打开特殊协议），则给出提示
    if (!newWindow) {
      message.info({
        content: (
          <div>
            <p>请手动打开浏览器插件管理页面：</p>
            <p className="mt-2 text-blue-600 font-mono text-sm">{extensionUrl}</p>
          </div>
        ),
        duration: 8,
      });
    }
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
                  <Chrome className="w-8 h-8 text-blue-600" />
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
                  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Firefox Browser</title><path d="M8.824 7.287c.008 0 .004 0 0 0zm-2.8-1.4c.006 0 .003 0 0 0zm16.754 2.161c-.505-1.215-1.53-2.528-2.333-2.943.654 1.283 1.033 2.57 1.177 3.53l.002.02c-1.314-3.278-3.544-4.6-5.366-7.477-.091-.147-.184-.292-.273-.446a3.545 3.545 0 01-.13-.24 2.118 2.118 0 01-.172-.46.03.03 0 00-.027-.03.038.038 0 00-.021 0l-.006.001a.037.037 0 00-.01.005L15.624 0c-2.585 1.515-3.657 4.168-3.932 5.856a6.197 6.197 0 00-2.305.587.297.297 0 00-.147.37c.057.162.24.24.396.17a5.622 5.622 0 012.008-.523l.067-.005a5.847 5.847 0 011.957.222l.095.03a5.816 5.816 0 01.616.228c.08.036.16.073.238.112l.107.055a5.835 5.835 0 01.368.211 5.953 5.953 0 012.034 2.104c-.62-.437-1.733-.868-2.803-.681 4.183 2.09 3.06 9.292-2.737 9.02a5.164 5.164 0 01-1.513-.292 4.42 4.42 0 01-.538-.232c-1.42-.735-2.593-2.121-2.74-3.806 0 0 .537-2 3.845-2 .357 0 1.38-.998 1.398-1.287-.005-.095-2.029-.9-2.817-1.677-.422-.416-.622-.616-.8-.767a3.47 3.47 0 00-.301-.227 5.388 5.388 0 01-.032-2.842c-1.195.544-2.124 1.403-2.8 2.163h-.006c-.46-.584-.428-2.51-.402-2.913-.006-.025-.343.176-.389.206-.406.29-.787.616-1.136.974-.397.403-.76.839-1.085 1.303a9.816 9.816 0 00-1.562 3.52c-.003.013-.11.487-.19 1.073-.013.09-.026.181-.037.272a7.8 7.8 0 00-.069.667l-.002.034-.023.387-.001.06C.386 18.795 5.593 24 12.016 24c5.752 0 10.527-4.176 11.463-9.661.02-.149.035-.298.052-.448.232-1.994-.025-4.09-.753-5.844z"/></svg>
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

        <div className="mb-6">
          <h4 className="font-medium mb-2" style={{ color: '#ff7139' }}>Firefox 安装步骤：</h4>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-2">
            <li>下载插件压缩包并解压到任意目录</li>
            <li>打开 Firefox，在地址栏输入 <code className="bg-gray-100 px-2 py-0.5 rounded">about:debugging#/runtime/this-firefox</code></li>
            <li>点击"临时加载附加组件"按钮</li>
            <li>选择解压目录中的 <code className="bg-gray-100 px-2 py-0.5 rounded">manifest.json</code> 文件</li>
            <li className="text-orange-600 text-sm">
              注意：临时加载的插件在浏览器重启后会失效，需要重新加载
            </li>
          </ol>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <h4 className="font-medium text-yellow-800 mb-2">使用前配置：</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 ml-2">
            <li>安装插件后，点击浏览器工具栏上的插件图标</li>
            <li>点击"设置"按钮</li>
            <li>输入 API 服务器地址（例如：<code className="bg-white px-2 py-0.5 rounded">http://localhost:9527</code>）</li>
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
