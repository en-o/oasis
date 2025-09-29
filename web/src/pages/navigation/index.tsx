import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import IconDisplay from '@/components/IconDisplay';
import NavGrid from '@/components/NavGrid';
import NavList from '@/components/NavList';
import LoginModal from '@/components/LoginModal';
import { navApi, categoryApi, systemApi } from '@/apis';
import type { NavItem, SystemConfig } from '@/types';
import { Grid, List, Settings } from 'lucide-react';
import './index.css';

interface Props {
  onEnterAdmin: () => void;
}

const Navigation: React.FC<Props> = ({ onEnterAdmin }) => {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [jumpMethod, setJumpMethod] = useState<'newTab' | 'currentTab'>('newTab');
  const [showLogin, setShowLogin] = useState(false);
  const [accountMap, setAccountMap] = useState<Record<number, boolean>>({});
  const [secret, setSecret] = useState('');

  useEffect(() => {
    Promise.all([navApi.list(), categoryApi.list(), systemApi.get()]).then(
      ([navs, cats, cfg]) => {
        setNavItems(navs);
        setCategories(cats);
        setSystemConfig(cfg);
        setJumpMethod(cfg.defaultOpenMode);
      }
    );
  }, []);

  if (!systemConfig) return null;

  const allCategories = ['全部', ...categories];
  const filtered = navItems
    .filter(
      (i) =>
        (i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.remark.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedCategory === '全部' || i.category === selectedCategory)
    )
    .sort((a, b) => a.sort - b.sort);

  const handleLogin = (u: string, p: string) =>
    u === systemConfig.user.username && p === systemConfig.user.password;

  const toggleAccount = (id: number) => {
    if (secret === 'tan') {
      setAccountMap((m) => ({ ...m, [id]: !m[id] }));
    } else {
      const input = prompt('请输入密钥查看账户信息（默认：tan）');
      if (input === 'tan') {
        setSecret('tan');
        setAccountMap((m) => ({ ...m, [id]: true }));
      } else {
        alert('密钥错误');
      }
    }
  };

  return (
    <div className="nav-container">
      <header className="nav-header">
        <div className="nav-header-content">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <IconDisplay
                iconData={systemConfig.siteLogo}
                title={systemConfig.siteTitle}
                size="w-8 h-8"
              />
              <h1 className="text-2xl font-bold text-gray-800">
                {systemConfig.siteTitle}
              </h1>
            </div>
            {!systemConfig.hideAdminEntry && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">打开方式:</span>
                  <select
                    className="px-3 py-1 text-sm border rounded-md"
                    value={jumpMethod}
                    onChange={(e) =>
                      setJumpMethod(e.target.value as 'newTab' | 'currentTab')
                    }
                  >
                    <option value="newTab">新标签页</option>
                    <option value="currentTab">当前标签页</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">视图:</span>
                  <div className="view-toggle">
                    <button
                      className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowLogin(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg"
                >
                  <Settings className="w-4 h-4" />
                  <span>管理后台</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="nav-main">
        <div className="search-section">
          <div className="search-container">
            <div className="flex flex-1 gap-4">
              <div className="category-select-group">
                <span className="category-label">分类:</span>
                <select
                  className="category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {allCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="search-input-group">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="搜索导航..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <NavGrid
            items={filtered}
            onNavigate={(item) =>
              window.open(item.url, jumpMethod === 'currentTab' ? '_self' : '_blank')
            }
            accountMap={accountMap}
            onToggleAccount={toggleAccount}
          />
        ) : (
          <NavList
            items={filtered}
            onNavigate={(item) =>
              window.open(item.url, jumpMethod === 'currentTab' ? '_self' : '_blank')
            }
            accountMap={accountMap}
            onToggleAccount={toggleAccount}
          />
        )}
      </div>

      <LoginModal
        visible={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={(u, p) => {
          const ok = u === systemConfig.user.username && p === systemConfig.user.password;
          if (ok) onEnterAdmin();
          return ok;
        }}
      />
    </div>
  );
};

export default Navigation;