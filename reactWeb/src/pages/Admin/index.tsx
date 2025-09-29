import React, { useState } from 'react';
import { Button } from 'antd';
import { ArrowLeft, LogOut } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import NavManagement from './components/NavManagement';
import CategoryManagement from './components/CategoryManagement';
import SystemManagement from './components/SystemManagement';

interface Props {
  onExit: () => void;
}

const Admin: React.FC<Props> = ({ onExit }) => {
  const [currentTab, setCurrentTab] = useState<
    'nav-management' | 'category-management' | 'system-management'
  >('nav-management');

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="nav-header-content">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">管理后台</h1>
            <div className="flex items-center space-x-4">
              <Button
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={onExit}
                className="flex items-center"
              >
                返回导航
              </Button>
              <Button
                type="primary"
                danger
                icon={<LogOut className="w-4 h-4" />}
                onClick={onExit}
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