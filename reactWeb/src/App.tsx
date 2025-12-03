import React, { useEffect } from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import zhCN from 'antd/locale/zh_CN';
import Navigation from '@/pages/Navigation';
import Admin from '@/pages/Admin';
import { setMessageApi } from '@/utils/request';

// 获取基础路径
const getBasename = () => {
  const basePath = import.meta.env.VITE_BASE_PATH || '/';
  // 移除尾部的斜杠（除非是根路径 "/"）
  return basePath === '/' ? '' : basePath.replace(/\/$/, '');
};

// 内部组件，用于访问 App 的静态方法
const AppContent: React.FC = () => {
  const { message } = AntdApp.useApp();

  // 在组件挂载时初始化全局 message API
  useEffect(() => {
    setMessageApi(message);
  }, [message]);

  return (
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
  );
};

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <AntdApp
        message={{
          top: 100,
          duration: 3,
          maxCount: 3,
        }}
      >
        <AppContent />
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
