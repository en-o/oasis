import React from 'react';
import './index.css';

interface Props {
  currentAdminTab: string;
  onChangeTab: (tab: string) => void;
}

const tabs = [
  { id: 'nav-management', label: '导航页面管理' },
  { id: 'category-management', label: '分类管理' },
  { id: 'system-management', label: '系统管理' },
];

const AdminSidebar: React.FC<Props> = ({ currentAdminTab, onChangeTab }) => (
  <div className="admin-sidebar">
    <nav className="space-y-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`admin-nav-button ${
            currentAdminTab === tab.id ? 'active' : ''
          }`}
          onClick={() => onChangeTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  </div>
);

export default AdminSidebar;