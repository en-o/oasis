import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '@/components/AdminSidebar';
import NavManagement from './components/NavManagement';
import CategoryManagement from './components/CategoryManagement';
import SystemManagement from './components/SystemManagement';
import LoginModal from '@/components/LoginModal';
import { authApi } from '@/services/api';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState<
    'nav-management' | 'category-management' | 'system-management'
  >('nav-management');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // 检查是否已登录
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setShowLogin(true);
    }
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await authApi.login({ username, password });

      if (response.code === 200 && response.data) {
        localStorage.setItem('token', response.data);
        setIsAuthenticated(true);
        setShowLogin(false);
        return true;
      } else {
        console.error('登录失败:', response.message || '未返回 token');
        return false;
      }
    } catch (error) {
      console.error('登录请求失败:', error);
      return false;
    }
  };

  const handleBackToNavigation = () => {
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/');
  };

  // 如果未认证，显示登录模态框
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">管理后台</h1>
          <p className="text-blue-100 mb-8">请登录以访问管理功能</p>
          <Button
            type="primary"
            size="large"
            onClick={() => setShowLogin(true)}
            className="bg-white text-blue-600 border-none hover:bg-blue-50"
          >
            点击登录
          </Button>
        </div>

        <LoginModal
          visible={showLogin}
          onClose={() => navigate('/')}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="nav-header-content">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">管理后台</h1>
            <div className="flex items-center space-x-4">
              <Button
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={handleBackToNavigation}
                className="flex items-center"
              >
                返回导航
              </Button>
              <Button
                type="primary"
                danger
                icon={<LogOut className="w-4 h-4" />}
                onClick={handleLogout}
                className="flex items-center"
              >
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="admin-main">
        <div className="flex gap-6 h-full overflow-hidden">
          <div className="admin-sidebar flex-shrink-0">
            <AdminSidebar currentAdminTab={currentTab} onChangeTab={setCurrentTab} />
          </div>
          <div className="flex-1 admin-content overflow-auto">
            {currentTab === 'nav-management' && <NavManagement />}
            {currentTab === 'category-management' && <CategoryManagement />}
            {currentTab === 'system-management' && <SystemManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;