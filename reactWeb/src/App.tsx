import React, { useState } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Navigation from '@/pages/Navigation';
import Admin from '@/pages/Admin';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'navigation' | 'admin'>('navigation');

  const handleEnterAdmin = () => {
    setCurrentView('admin');
  };

  const handleExitAdmin = () => {
    setCurrentView('navigation');
  };

  return (
    <ConfigProvider locale={zhCN}>
      <div className="app">
        {currentView === 'navigation' ? (
          <Navigation onEnterAdmin={handleEnterAdmin} />
        ) : (
          <Admin onExit={handleExitAdmin} />
        )}
      </div>
    </ConfigProvider>
  );
};

export default App;
