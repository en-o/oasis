import React from 'react';
import { ConfigProvider, App as AntdApp, message } from 'antd';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import zhCN from 'antd/locale/zh_CN';
import Navigation from '@/pages/Navigation';
import Admin from '@/pages/Admin';

// 配置 message 全局配置
message.config({
  top: 100,
  duration: 3,
  maxCount: 3,
});

// 获取基础路径
const getBasename = () => {
  const basePath = import.meta.env.VITE_BASE_PATH || '/';
  // 移除尾部的斜杠（除非是根路径 "/"）
  return basePath === '/' ? '' : basePath.replace(/\/$/, '');
};

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <AntdApp>
        <Router basename={getBasename()}>
          <div className="app">
            <Routes>
              <Route path="/" element={<Navigation />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/*" element={<Admin />} />
              {/* 所有其他路径也显示 Navigation 组件，支持自定义页面 */}
              <Route path="*" element={<Navigation />} />
            </Routes>
          </div>
        </Router>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
