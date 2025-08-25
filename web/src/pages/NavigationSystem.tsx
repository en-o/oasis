import React, { useState } from 'react';
import {
  Search,
  Settings,
  Plus,
  Edit2,
  Trash2,
  X,
  Eye,
  EyeOff,
  ExternalLink,
  Grid,
  List,
} from 'lucide-react';
import type { NavItem, SystemConfig } from '@/types';
import {
  initialNavItems,
  initialCategories,
  initialSystemConfig,
} from '@/utils/mock';

const NavigationSystem = () => {
  // 状态管理
  const [navItems, setNavItems] = useState<NavItem[]>(initialNavItems);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [systemConfig, setSystemConfig] =
    useState<SystemConfig>(initialSystemConfig);
  const [currentView, setCurrentView] = useState('navigation'); // navigation, admin
  const [currentAdminTab, setCurrentAdminTab] = useState('nav-management'); // nav-management, category-management, system-management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [jumpMethod, setJumpMethod] = useState<'newTab' | 'currentTab'>(
    'newTab'
  );
  const [viewMode, setViewMode] = useState('grid');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 新增：查看账户信息
  const [showAccountSecret, setShowAccountSecret] = useState('');
  const [showAccountMap, setShowAccountMap] = useState<Record<number, boolean>>(
    {}
  );

  // 编辑状态
  const [editingNav, setEditingNav] = useState<NavItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [showNavForm, setShowNavForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  // 表单数据
  const [navForm, setNavForm] = useState<Omit<NavItem, 'id'>>({
    order: 0,
    name: '',
    url: '',
    sort: 0,
    category: '',
    icon: '',
    remark: '',
    accountInfo: { account: '', password: '' },
  });

  const [categoryForm, setCategoryForm] = useState('');

  // 获取所有分类（包括"全部"）
  const allCategories = ['全部', ...categories];

  // 过滤导航项
  const filteredNavItems = navItems
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.remark.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === '全部' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => a.sort - b.sort);

  // 图标类型检测函数
  const getIconType = (iconData: string) => {
    if (!iconData || iconData.trim() === '') return 'empty';
    if (iconData.startsWith('data:')) return 'base64';
    if (iconData.startsWith('http')) return 'url';
    return 'invalid';
  };

  // 生成随机颜色的函数
  const getRandomGradient = (text: string) => {
    const gradients = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-green-500 to-green-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-yellow-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-teal-500 to-teal-600',
      'from-orange-500 to-orange-600',
      'from-cyan-500 to-cyan-600',
      'from-emerald-500 to-emerald-600',
      'from-rose-500 to-rose-600',
      'from-violet-500 to-violet-600',
      'from-amber-500 to-amber-600',
      'from-lime-500 to-lime-600',
      'from-sky-500 to-sky-600',
    ];

    // 基于文本内容生成一致的颜色（相同文本总是相同颜色）
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换为32位整数
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  // 图标组件，包含错误处理和固定尺寸
  const IconDisplay = ({
    iconData,
    title,
    size = 'w-12 h-12',
  }: {
    iconData: string;
    title: string;
    size?: string;
  }) => {
    const defaultText = title.slice(0, 2).toUpperCase();
    const gradientClass = getRandomGradient(title);

    if (!iconData || iconData.trim() === '') {
      return (
        <div
          className={`${size} rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white font-bold flex-shrink-0`}
          style={{
            fontSize: size.includes('w-8')
              ? '10px'
              : size.includes('w-10')
              ? '12px'
              : '14px',
          }}
        >
          {defaultText}
        </div>
      );
    }

    return (
      <div className={`${size} relative flex-shrink-0`}>
        <img
          src={iconData}
          alt={title}
          className={`${size} rounded-lg object-cover`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const nextSibling = target.nextElementSibling as HTMLElement;
            if (nextSibling) {
              nextSibling.style.display = 'flex';
            }
          }}
        />
        <div
          className={`${size} rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white font-bold absolute top-0 left-0`}
          style={{
            display: 'none',
            fontSize: size.includes('w-8')
              ? '10px'
              : size.includes('w-10')
              ? '12px'
              : '14px',
          }}
        >
          {defaultText}
        </div>
      </div>
    );
  };

  // 登录处理
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      loginForm.username === systemConfig.user.username &&
      loginForm.password === systemConfig.user.password
    ) {
      setIsAuthenticated(true);
      setShowLogin(false);
      setLoginForm({ username: '', password: '' });
      setCurrentView('admin');
    } else {
      alert('用户名或密码错误！请检查输入的账户信息');
    }
  };

  // 跳转处理
  const handleNavigation = (item: NavItem) => {
    const method = jumpMethod === 'currentTab' ? '_self' : '_blank';
    window.open(item.url, method);
  };

  // 导航项CRUD操作
  const handleSaveNav = () => {
    if (editingNav) {
      setNavItems(
        navItems.map((item) =>
          item.id === editingNav.id ? { ...navForm, id: editingNav.id } : item
        )
      );
    } else {
      const newId = Math.max(...navItems.map((item) => item.id), 0) + 1;
      setNavItems([...navItems, { ...navForm, id: newId } as NavItem]);
    }
    resetNavForm();
  };

  const handleEditNav = (item: NavItem) => {
    setEditingNav(item);
    setNavForm(item);
    setShowNavForm(true);
  };

  const handleDeleteNav = (id: number) => {
    if (confirm('确定要删除这个导航项吗？')) {
      setNavItems(navItems.filter((item) => item.id !== id));
    }
  };

  const resetNavForm = () => {
    setNavForm({
      order: 0,
      name: '',
      url: '',
      sort: 0,
      category: '',
      icon: '',
      remark: '',
      accountInfo: { account: '', password: '' },
    });
    setEditingNav(null);
    setShowNavForm(false);
  };

  // 分类CRUD操作
  const handleSaveCategory = () => {
    if (editingCategory !== null) {
      const newCategories = [...categories];
      newCategories[editingCategory] = categoryForm;
      setCategories(newCategories);
    } else {
      setCategories([...categories, categoryForm]);
    }
    resetCategoryForm();
  };

  const handleEditCategory = (index: number) => {
    setEditingCategory(index);
    setCategoryForm(categories[index]);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = (index: number) => {
    if (confirm('确定要删除这个分类吗？相关的导航项将需要重新分类。')) {
      setCategories(categories.filter((_, i) => i !== index));
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm('');
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  // 系统配置更新
  const handleSystemConfigUpdate = (key: keyof SystemConfig, value: any) => {
    setSystemConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleUserUpdate = (key: keyof SystemConfig['user'], value: string) => {
    setSystemConfig((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        [key]: value,
      },
    }));
  };

  // 新增：处理查看账户信息
  const handleShowAccount = (itemId: number) => {
    if (showAccountSecret === 'tan') {
      setShowAccountMap((prev) => ({
        ...prev,
        [itemId]: !prev[itemId],
      }));
    } else {
      const input = prompt('请输入密钥查看账户信息（默认：tan）');
      if (input === 'tan') {
        setShowAccountSecret('tan');
        setShowAccountMap((prev) => ({
          ...prev,
          [itemId]: true,
        }));
      } else {
        alert('密钥错误');
      }
    }
  };

  // 导航页面渲染
  const renderNavigationPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
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
                {/* 跳转方式选择 */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">打开方式:</span>
                  <select
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    value={jumpMethod}
                    onChange={(e) =>
                      setJumpMethod(e.target.value as 'newTab' | 'currentTab')
                    }
                  >
                    <option value="newTab">新标签页</option>
                    <option value="currentTab">当前标签页</option>
                  </select>
                </div>

                {/* 视图切换 */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">视图:</span>
                  <div className="flex border border-gray-300 rounded-md">
                    <button
                      className={`p-1.5 ${
                        viewMode === 'grid'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-600'
                      } rounded-l-md`}
                      onClick={() => setViewMode('grid')}
                      title="网格视图"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      className={`p-1.5 ${
                        viewMode === 'list'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-600'
                      } rounded-r-md`}
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
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>管理后台</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 搜索和过滤区域 */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 搜索和分类作为一组 */}
            <div className="flex flex-1 gap-4">
              {/* 分类筛选 */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  分类:
                </span>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-w-32"
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

              {/* 搜索框 */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索导航..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 导航项展示 */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredNavItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer group"
                onClick={() => handleNavigation(item)}
              >
                <div className="flex items-center space-x-4">
                  <IconDisplay
                    iconData={item.icon}
                    title={item.name}
                    size="w-12 h-12"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 group-hover:text-blue-600">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{item.remark}</p>
                    <span className="inline-block bg-gray-100 text-xs text-gray-600 px-2 py-1 rounded-full mt-2">
                      {item.category}
                    </span>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </div>

                {/* 新增：账户信息查看按钮 */}
                <div className="mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowAccount(item.id);
                    }}
                    className="text-xs text-blue-600 underline"
                  >
                    查看账户信息
                  </button>
                  {showAccountMap[item.id] && item.accountInfo?.account && (
                    <div className="mt-2 text-xs text-gray-600">
                      <div>账户：{item.accountInfo.account}</div>
                      <div>密码：{item.accountInfo.password}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm">
            {filteredNavItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-4 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer group"
                onClick={() => handleNavigation(item)}
              >
                <IconDisplay
                  iconData={item.icon}
                  title={item.name}
                  size="w-10 h-10"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-blue-600">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500">{item.remark}</p>
                </div>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {item.category}
                </span>
                <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />

                {/* 新增：账户信息查看按钮 */}
                <div className="flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowAccount(item.id);
                    }}
                    className="text-xs text-blue-600 underline"
                  >
                    查看账户信息
                  </button>
                  {showAccountMap[item.id] && item.accountInfo?.account && (
                    <div className="mt-1 text-xs text-gray-600">
                      <div>账户：{item.accountInfo.account}</div>
                      <div>密码：{item.accountInfo.password}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 登录弹窗 */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-96 max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">管理员登录</h2>
              <button onClick={() => setShowLogin(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">用户名</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  required
                  placeholder="请输入用户名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">密码</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                    placeholder="请输入密码"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                默认账户: tan / 123
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                登录
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // 管理页面渲染
  const renderAdminPage = () => (
    <div className="min-h-screen bg-gray-100">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">管理后台</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('navigation')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                返回导航
              </button>
              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  setCurrentView('navigation');
                }}
                className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* 侧边栏 */}
          <div className="w-64 bg-white rounded-xl shadow-sm p-6">
            <nav className="space-y-2">
              <button
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  currentAdminTab === 'nav-management'
                    ? 'bg-blue-100 text-blue-600'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setCurrentAdminTab('nav-management')}
              >
                导航页面管理
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  currentAdminTab === 'category-management'
                    ? 'bg-blue-100 text-blue-600'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setCurrentAdminTab('category-management')}
              >
                分类管理
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  currentAdminTab === 'system-management'
                    ? 'bg-blue-100 text-blue-600'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setCurrentAdminTab('system-management')}
              >
                系统管理
              </button>
            </nav>
          </div>

          {/* 主要内容区域 */}
          <div className="flex-1">
            {currentAdminTab === 'nav-management' && renderNavManagement()}
            {currentAdminTab === 'category-management' &&
              renderCategoryManagement()}
            {currentAdminTab === 'system-management' &&
              renderSystemManagement()}
          </div>
        </div>
      </div>

      {/* 导航项编辑弹窗 */}
      {showNavForm && renderNavForm()}

      {/* 分类编辑弹窗 */}
      {showCategoryForm && renderCategoryForm()}
    </div>
  );

  // 导航管理
  const renderNavManagement = () => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">导航页面管理</h2>
        <button
          onClick={() => setShowNavForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          <span>添加导航</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">序号</th>
              <th className="text-left py-3 px-4">名称</th>
              <th className="text-left py-3 px-4">网址</th>
              <th className="text-left py-3 px-4">分类</th>
              <th className="text-left py-3 px-4">排序</th>
              <th className="text-left py-3 px-4">账户信息</th>
              <th className="text-left py-3 px-4">操作</th>
            </tr>
          </thead>
          <tbody>
            {navItems.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{item.order}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <IconDisplay
                      iconData={item.icon}
                      title={item.name}
                      size="w-8 h-8"
                    />
                    <span>{item.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 max-w-xs truncate">{item.url}</td>
                <td className="py-3 px-4">{item.category}</td>
                <td className="py-3 px-4">{item.sort}</td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {item.accountInfo?.account && item.accountInfo?.password ? (
                    <div>
                      <div>账户：{item.accountInfo.account}</div>
                      <div>密码：{item.accountInfo.password}</div>
                    </div>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditNav(item)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNav(item.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // 分类管理
  const renderCategoryManagement = () => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">分类管理</h2>
        <button
          onClick={() => setShowCategoryForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          <span>添加分类</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{category}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditCategory(index)}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(index)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {navItems.filter((item) => item.category === category).length}{' '}
              个导航项
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  // 系统管理
  const renderSystemManagement = () => (
    <div className="space-y-6">
      {/* 网站信息管理 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6">网站信息管理</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">网站标题</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={systemConfig.siteTitle}
              onChange={(e) =>
                handleSystemConfigUpdate('siteTitle', e.target.value)
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">网站Logo</label>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                当前类型:{' '}
                <span className="font-medium">
                  {(() => {
                    const type = getIconType(systemConfig.siteLogo);
                    switch (type) {
                      case 'base64':
                        return 'Base64 编码图片';
                      case 'url':
                        return 'HTTP/HTTPS 链接';
                      case 'empty':
                        return '空值 (将显示默认图标)';
                      case 'invalid':
                        return '无效格式';
                      default:
                        return '未知';
                    }
                  })()}
                </span>
              </div>
              <div className="flex items-start space-x-4 mb-3">
                <span className="text-sm font-medium mt-2 flex-shrink-0">
                  预览:
                </span>
                <div className="flex-shrink-0">
                  <IconDisplay
                    iconData={systemConfig.siteLogo}
                    title={systemConfig.siteTitle}
                    size="w-10 h-10"
                    key={`${systemConfig.siteLogo}-${systemConfig.siteTitle}`}
                  />
                </div>
              </div>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                value={systemConfig.siteLogo}
                onChange={(e) =>
                  handleSystemConfigUpdate('siteLogo', e.target.value)
                }
                placeholder="请输入Logo地址或Base64编码..."
              />
              <div className="text-xs text-gray-500">
                支持HTTP链接或Base64编码，留空将使用网站标题前两字作为默认Logo
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              默认跳转方式
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={systemConfig.defaultOpenMode}
              onChange={(e) =>
                handleSystemConfigUpdate('defaultOpenMode', e.target.value)
              }
            >
              <option value="newTab">新标签页</option>
              <option value="currentTab">当前标签页</option>
            </select>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="hideAdmin"
              checked={systemConfig.hideAdminEntry}
              onChange={(e) =>
                handleSystemConfigUpdate('hideAdminEntry', e.target.checked)
              }
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="hideAdmin" className="text-sm font-medium">
              隐藏管理后台入口
            </label>
          </div>
        </div>
      </div>

      {/* 用户管理 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6">用户管理</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">用户名</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={systemConfig.user.username}
              onChange={(e) => handleUserUpdate('username', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">密码</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={systemConfig.user.password}
              onChange={(e) => handleUserUpdate('password', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // 导航项表单
  const renderNavForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-96 max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {editingNav ? '编辑导航' : '添加导航'}
          </h2>
          <button onClick={resetNavForm}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">名称</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={navForm.name}
              onChange={(e) =>
                setNavForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">网址</label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={navForm.url}
              onChange={(e) =>
                setNavForm((prev) => ({ ...prev, url: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">分类</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={navForm.category}
              onChange={(e) =>
                setNavForm((prev) => ({ ...prev, category: e.target.value }))
              }
            >
              <option value="">请选择分类</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">排序</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={navForm.sort}
              onChange={(e) =>
                setNavForm((prev) => ({
                  ...prev,
                  sort: parseInt(e.target.value) || 0,
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">图标</label>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                当前类型:{' '}
                <span className="font-medium">
                  {(() => {
                    const type = getIconType(navForm.icon);
                    switch (type) {
                      case 'base64':
                        return 'Base64 编码图片';
                      case 'url':
                        return 'HTTP/HTTPS 链接';
                      case 'empty':
                        return '空值 (将显示默认图标)';
                      case 'invalid':
                        return '无效格式';
                      default:
                        return '未知';
                    }
                  })()}
                </span>
              </div>
              <div className="flex items-start space-x-4 mb-3">
                <span className="text-sm font-medium mt-2 flex-shrink-0">
                  预览:
                </span>
                <div className="flex-shrink-0">
                  <IconDisplay
                    iconData={navForm.icon}
                    title={navForm.name || '示例'}
                    size="w-10 h-10"
                    key={`${navForm.icon}-${navForm.name}`}
                  />
                </div>
              </div>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                value={navForm.icon}
                onChange={(e) =>
                  setNavForm((prev) => ({ ...prev, icon: e.target.value }))
                }
                placeholder="请输入图标地址或Base64编码..."
              />
              <div className="text-xs text-gray-500">
                支持HTTP链接或Base64编码，留空将使用名称前两字作为默认图标
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">备注</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={navForm.remark}
              onChange={(e) =>
                setNavForm((prev) => ({ ...prev, remark: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">账户信息</label>
            <div className="space-y-2">
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="账户"
                value={navForm.accountInfo.account}
                onChange={(e) =>
                  setNavForm((prev) => ({
                    ...prev,
                    accountInfo: {
                      ...prev.accountInfo,
                      account: e.target.value,
                    },
                  }))
                }
              />
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="密码"
                value={navForm.accountInfo.password}
                onChange={(e) =>
                  setNavForm((prev) => ({
                    ...prev,
                    accountInfo: {
                      ...prev.accountInfo,
                      password: e.target.value,
                    },
                  }))
                }
              />
            </div>
          </div>
          <button
            onClick={handleSaveNav}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );

  // 分类表单
  const renderCategoryForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-96 max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {editingCategory !== null ? '编辑分类' : '添加分类'}
          </h2>
          <button onClick={resetCategoryForm}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">分类名称</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={categoryForm}
              onChange={(e) => setCategoryForm(e.target.value)}
            />
          </div>
          <button
            onClick={handleSaveCategory}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );

  return currentView === 'navigation'
    ? renderNavigationPage()
    : renderAdminPage();
};

export default NavigationSystem;
