import React from 'react';
import { Menu } from 'antd';
import { Navigation, Bookmark, Settings, Database } from 'lucide-react';

interface Props {
  currentAdminTab: 'nav-management' | 'category-management' | 'system-management' | 'backup-management';
  onChangeTab: (tab: 'nav-management' | 'category-management' | 'system-management' | 'backup-management') => void;
}

const AdminSidebar: React.FC<Props> = ({ currentAdminTab, onChangeTab }) => {
  const menuItems = [
    {
      key: 'nav-management',
      icon: <Navigation className="w-4 h-4" />,
      label: '导航管理',
    },
    {
      key: 'category-management',
      icon: <Bookmark className="w-4 h-4" />,
      label: '分类管理',
    },
    {
      key: 'system-management',
      icon: <Settings className="w-4 h-4" />,
      label: '系统配置',
    },
    {
      key: 'backup-management',
      icon: <Database className="w-4 h-4" />,
      label: '备份管理',
    },
  ];

  return (
    <div className="w-64">
      <Menu
        mode="inline"
        selectedKeys={[currentAdminTab]}
        items={menuItems}
        onClick={({ key }) => onChangeTab(key as any)}
        className="bg-white rounded-lg border-0 shadow-sm"
      />
    </div>
  );
};

export default AdminSidebar;