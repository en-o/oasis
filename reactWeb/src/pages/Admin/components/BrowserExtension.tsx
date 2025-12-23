import React from 'react';
import { Button, Card, Row, Col, App } from 'antd';
import { Download, Chrome } from 'lucide-react';

const BrowserExtension: React.FC = () => {
  const { message } = App.useApp();

  // 处理插件下载
  const handleDownloadExtension = (browser: 'chrome' | 'firefox') => {
    const fileName = browser === 'chrome' ? 'oasisassist-chrome.zip' : 'oasisassist-firefox.zip';
    const downloadUrl = `/extensions/${fileName}`;

    // 创建隐藏的下载链接
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success(`开始下载 ${browser === 'chrome' ? 'Chrome/Edge' : 'Firefox'} 版本插件`);
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
                  <svg className="w-8 h-8 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.05 11.75c-.35-3.23-2.56-5.95-5.65-6.96a7.06 7.06 0 0 0-8.53 3.38 5.96 5.96 0 0 0-4.61 4.48c-1.47.28-2.62 1.54-2.62 3.1 0 1.73 1.41 3.14 3.14 3.14h16.18c1.78 0 3.23-1.45 3.23-3.23-.01-1.49-1.03-2.73-2.42-3.09l.28.18zm-9.78 4.12v-4.62h2.36l-3.51-4.72-3.51 4.72h2.36v4.62h2.3z"/>
                  </svg>
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
