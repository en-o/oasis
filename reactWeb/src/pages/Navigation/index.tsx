import React, { useState, useMemo, useEffect } from 'react';
import { Search, Grid, List, Settings, ExternalLink, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '@/hooks/useNavigation';
import { authApi, webApi } from '@/services/api';
import IconDisplay from '@/components/IconDisplay';
import NavGrid from '@/components/NavGrid';
import NavList from '@/components/NavList';
import LoginModal from '@/components/LoginModal';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const { navItems, categories, systemConfig, loading } = useNavigation();


  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [jumpMethod, setJumpMethod] = useState<'newTab' | 'currentTab'>('newTab'); // 初始默认值
  const [showLogin, setShowLogin] = useState(false);
  const [accountMap, setAccountMap] = useState<Record<number, boolean>>({});
  const [accountDataMap, setAccountDataMap] = useState<Record<number, { account: string; password: string }>>({});

  // 当 systemConfig 加载完成后，更新 jumpMethod
  useEffect(() => {
    console.log('=== 更新 jumpMethod ===');
    console.log('systemConfig.defaultOpenMode:', systemConfig.defaultOpenMode);
    setJumpMethod(systemConfig.defaultOpenMode);
  }, [systemConfig.defaultOpenMode]);

  const allCategories = ['全部', ...categories.map(c => c.categoryName)];

  const filteredItems = useMemo(() => {

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

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => a.sort - b.sort);

    return result;
  }, [navItems, searchTerm, selectedCategory]);

  const handleLogin = async (username: string, password: string) => {
    try {
      // 使用标准的 API 调用方式
      const response = await authApi.login({ username, password });

      if (response.code === 200 && response.data) {
        // 登录成功，导航到管理页面
        localStorage.setItem('token', response.data);
        navigate('/admin');
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

  const toggleAccount = async (id: number) => {
    const item = navItems.find(item => item.id === id);
    if (!item) return;

    // 如果没有账户信息，直接返回
    if (!item.hasAccount) {
      return;
    }

    // 如果已经显示了，就隐藏
    if (accountMap[id]) {
      setAccountMap(prev => ({ ...prev, [id]: false }));
      return;
    }

    try {
      let response;

      // 如果 lookAccount 为 true，直接请求账户信息
      if (item.lookAccount) {
        response = await webApi.getNavAccess(id);
      } else {
        // 如果 lookAccount 为 false，需要密钥验证
        const secret = prompt('请输入密钥查看账户信息');
        if (!secret) {
          return; // 用户取消
        }

        response = await webApi.getNavAccess(id, secret);
      }

      if (response.code === 200 && response.data) {
        // 保存账户信息并显示
        setAccountDataMap(prev => ({
          ...prev,
          [id]: {
            account: response.data.account,
            password: response.data.password
          }
        }));
        setAccountMap(prev => ({ ...prev, [id]: true }));
      } else {
        alert(response.message || '获取账户信息失败');
      }
    } catch (error: any) {
      console.error('获取账户信息失败:', error);
      alert(error.message || '获取账户信息失败，请检查密钥是否正确');
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

              {/* 管理后台按钮 - 只有这个按钮受 hideAdminEntry 控制 */}
              {!systemConfig.hideAdminEntry && (
                <button
                  onClick={() => setShowLogin(true)}
                  className="admin-button"
                  title="管理后台"
                >
                  <Settings className="w-4 h-4" />
                  <span className="ml-2">管理</span>
                </button>
              )}
            </div>
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
            return (
              <NavGrid
                items={filteredItems}
                accountMap={accountMap}
                accountDataMap={accountDataMap}
                onToggleAccount={toggleAccount}
                jumpMethod={jumpMethod}
              />
            );
          } else {
            console.log('显示：列表视图');
            return (
              <NavList
                items={filteredItems}
                accountMap={accountMap}
                accountDataMap={accountDataMap}
                onToggleAccount={toggleAccount}
                jumpMethod={jumpMethod}
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
