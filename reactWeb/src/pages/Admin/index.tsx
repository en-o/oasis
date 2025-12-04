import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { ArrowLeft, LogOut, Settings, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '@/components/AdminSidebar';
import NavManagement from './components/NavManagement';
import CategoryManagement from './components/CategoryManagement';
import SystemManagement from './components/SystemManagement';
import BackupManagement from './components/BackupManagement';
import SitePublishManagement from './components/SitePublishManagement';
import LoginModal from '@/components/LoginModal';
import { authApi } from '@/services/api';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState<
    'nav-management' | 'category-management' | 'system-management' | 'backup-management' | 'site-publish-management'
  >('nav-management');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // 检查是否已登录
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('nvatoken');
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setShowLogin(true);
      }
    };

    // 初始检查
    checkAuth();

    // 监听 storage 事件，以便在其他标签页登录/退出时同步状态
    window.addEventListener('storage', checkAuth);

    // 定期检查 token 是否存在（防止在其他地方被删除）
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await authApi.login({ username, password });

      if (response.code === 200 && response.data) {
        localStorage.setItem('nvatoken', response.data);
        setIsAuthenticated(true);
        setShowLogin(false);
        // 登录成功后不需要跳转，因为已经在 /admin 页面了
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
    localStorage.removeItem('nvatoken');
    setIsAuthenticated(false);
    navigate('/');
  };

  const handleLoginCancel = () => {
    // 用户取消登录，返回首页
    setShowLogin(false);
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
          onClose={handleLoginCancel}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 shadow-lg">
        <div className="nav-header-content">
          <div className="flex items-center justify-between py-4">
            {/* 左侧：Logo 和标题 */}
            <div className="flex items-center gap-4">
              <Shield className="w-7 h-7 text-white" />
              <h1 className="text-2xl font-bold text-white tracking-tight">
                管理后台
              </h1>
            </div>

            {/* 右侧：操作按钮组 */}
            <div className="flex items-center gap-6">
              <Button
                size="large"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={handleBackToNavigation}
                className="
                  bg-white/10 border-white/30 text-white
                  hover:bg-white/20 hover:border-white/40
                  backdrop-blur-sm
                  flex items-center gap-2
                  font-medium
                  shadow-sm hover:shadow-md
                  transition-all duration-200
                "
              >
                返回导航
              </Button>
              <Button
                type="primary"
                danger
                size="large"
                icon={<LogOut className="w-4 h-4" />}
                onClick={handleLogout}
                className="
                  flex items-center gap-2
                  font-medium
                  bg-red-500 border-red-500
                  hover:bg-red-600 hover:border-red-600
                  shadow-sm hover:shadow-md
                  transition-all duration-200
                "
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
          <div className="flex-1 admin-content">
            {currentTab === 'nav-management' && <NavManagement />}
            {currentTab === 'category-management' && <CategoryManagement />}
            {currentTab === 'site-publish-management' && <SitePublishManagement />}
            {currentTab === 'system-management' && <SystemManagement />}
            {currentTab === 'backup-management' && <BackupManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;