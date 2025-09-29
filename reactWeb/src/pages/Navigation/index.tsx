import React, { useState, useMemo, useEffect } from 'react';
import { Search, Grid, List, Settings, ExternalLink, Monitor } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { authApi } from '@/services/api';
import IconDisplay from '@/components/IconDisplay';
import NavGrid from '@/components/NavGrid';
import NavList from '@/components/NavList';
import LoginModal from '@/components/LoginModal';

interface Props {
  onEnterAdmin: () => void;
}

const Navigation: React.FC<Props> = ({ onEnterAdmin }) => {
  const { navItems, categories, systemConfig, loading } = useNavigation();
  console.log('=== Navigation 组件状态 ===');
  console.log('navItems 长度:', navItems.length);
  console.log('navItems 内容:', navItems);
  console.log('categories 长度:', categories.length);
  console.log('loading 状态:', loading);
  console.log('systemConfig:', systemConfig);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [jumpMethod, setJumpMethod] = useState<'newTab' | 'currentTab'>('newTab'); // 初始默认值
  const [showLogin, setShowLogin] = useState(false);
  const [accountMap, setAccountMap] = useState<Record<number, boolean>>({});
  const [secret, setSecret] = useState('');

  // 当 systemConfig 加载完成后，更新 jumpMethod
  useEffect(() => {
    console.log('=== 更新 jumpMethod ===');
    console.log('systemConfig.defaultOpenMode:', systemConfig.defaultOpenMode);
    setJumpMethod(systemConfig.defaultOpenMode);
  }, [systemConfig.defaultOpenMode]);

  const allCategories = ['全部', ...categories.map(c => c.categoryName)];

  const filteredItems = useMemo(() => {
    console.log('=== filteredItems 计算 ===');
    console.log('原始 navItems:', navItems);
    console.log('navItems 长度:', navItems.length);
    console.log('searchTerm:', searchTerm);
    console.log('selectedCategory:', selectedCategory);
    console.log('categories:', categories);

    if (navItems.length === 0) {
      console.warn('navItems 为空，返回空数组');
      return [];
    }

    const result = navItems
      .filter(item => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.remark.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          selectedCategory === '全部' || item.category === selectedCategory;

        console.log(`筛选项目 "${item.name}":`, {
          matchesSearch,
          matchesCategory,
          itemCategory: item.category,
          selectedCategory
        });

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => a.sort - b.sort);

    console.log('筛选结果长度:', result.length);
    console.log('筛选结果:', result);
    return result;
  }, [navItems, searchTerm, selectedCategory]);

  const handleLogin = async (username: string, password: string) => {
    try {
      // 使用标准的 API 调用方式
      const response = await authApi.login({ username, password });

      if (response.data) {
        // 登录成功
        localStorage.setItem('token', response.data);
        onEnterAdmin();
        return true;
      } else {
        console.error('登录失败: 未返回 token');
        return false;
      }
    } catch (error) {
      console.error('登录请求失败:', error);
      return false;
    }
  };

  const handleNavigate = (item: { url: string }) => {
    window.open(item.url, jumpMethod === 'currentTab' ? '_self' : '_blank');
  };

  const toggleAccount = (id: number) => {
    if (secret === 'tan') {
      setAccountMap(prev => ({ ...prev, [id]: !prev[id] }));
    } else {
      const input = prompt('请输入密钥查看账户信息（默认：tan）');
      if (input === 'tan') {
        setSecret('tan');
        setAccountMap(prev => ({ ...prev, [id]: true }));
      } else {
        alert('密钥错误');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

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
              <div className="flex items-center space-x-3">
                {/* 打开方式切换 */}
                <div className="flex items-center space-x-1">
                  <div className="view-toggle">
                    <button
                      className={`view-button ${jumpMethod === 'newTab' ? 'active' : ''}`}
                      onClick={() => setJumpMethod('newTab')}
                      title="新标签页打开"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      className={`view-button ${jumpMethod === 'currentTab' ? 'active' : ''}`}
                      onClick={() => setJumpMethod('currentTab')}
                      title="当前标签页打开"
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 视图切换 */}
                <div className="flex items-center space-x-1">
                  <div className="view-toggle">
                    <button
                      className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                      title="网格视图"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                      title="列表视图"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 管理后台按钮 */}
                <button
                  onClick={() => setShowLogin(true)}
                  className="admin-button"
                  title="管理后台"
                >
                  <Settings className="w-4 h-4" />
                  <span className="ml-2">管理</span>
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
                  {allCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
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

        {(() => {
          console.log('=== 渲染决策 ===');
          console.log('filteredItems.length:', filteredItems.length);
          console.log('viewMode:', viewMode);

          if (filteredItems.length === 0) {
            console.log('显示：暂无导航数据');
            return (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">暂无导航数据</p>
                <p className="text-gray-400 text-sm mt-2">
                  navItems: {navItems.length},
                  categories: {categories.length},
                  loading: {loading.toString()}
                </p>
              </div>
            );
          } else if (viewMode === 'grid') {
            console.log('显示：网格视图');
            return (
              <NavGrid
                items={filteredItems}
                onNavigate={handleNavigate}
                accountMap={accountMap}
                onToggleAccount={toggleAccount}
              />
            );
          } else {
            console.log('显示：列表视图');
            return (
              <NavList
                items={filteredItems}
                onNavigate={handleNavigate}
                accountMap={accountMap}
                onToggleAccount={toggleAccount}
              />
            );
          }
        })()}
      </div>

      <LoginModal
        visible={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default Navigation;