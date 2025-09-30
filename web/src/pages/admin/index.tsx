import React, { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import NavManagement from './components/NavManagement';
import CategoryManagement from './components/CategoryManagement';
import SystemManagement from './components/SystemManagement';
import BackupManagement from './components/BackupManagement';
import { useNavigation } from '@/hooks/useNavigation';
import './index.css';

interface Props {
  onExit: () => void;
}

const Admin: React.FC<Props> = ({ onExit }) => {
  const [currentTab, setCurrentTab] = useState<
    'nav-management' | 'category-management' | 'system-management' | 'backup-management'
  >('nav-management');
  const { navItems, setNavItems, categories, setCategories, systemConfig, setSystemConfig } =
    useNavigation();

  return (
    <div className="admin-container">
      <header className="nav-header">
        <div className="nav-header-content">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">管理后台</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={onExit}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                返回导航
              </button>
              <button
                onClick={() => {
                  onExit();
                }}
                className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="nav-main">
        <div className="flex gap-6">
          <AdminSidebar currentAdminTab={currentTab} onChangeTab={setCurrentTab} />
          <div className="flex-1">
            {currentTab === 'nav-management' && <NavManagement />}
            {currentTab === 'category-management' && <CategoryManagement />}
            {currentTab === 'system-management' && <SystemManagement />}
            {currentTab === 'backup-management' && <BackupManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;