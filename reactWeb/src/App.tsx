import React from 'react';
import { ConfigProvider } from 'antd';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import zhCN from 'antd/locale/zh_CN';
import Navigation from '@/pages/Navigation';
import Admin from '@/pages/Admin';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<Navigation />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/*" element={<Admin />} />
            {/* 404 重定向到首页 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
};

export default App;
