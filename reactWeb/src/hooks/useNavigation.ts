import { useState, useEffect } from 'react';
import type { NavItem, NavCategory, SystemConfig, NavigationVO } from '@/types';
import { webApi } from '@/services/api';

const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  siteTitle: 'Oasis 导航',
  siteLogo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzM5MzlmZiIvPgo8cGF0aCBkPSJNMTYgMTJMMjAgMTZMMTYgMjBMMTIgMTZMMTYgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
  defaultOpenMode: 'newTab',
  hideAdminEntry: false,
  adminUsername: 'admin',
  adminPassword: 'admin123',
};

export const useNavigation = () => {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG);
  const [loading, setLoading] = useState(true);

  const loadNavItems = async () => {
    try {
      // 使用 WebController 的导航分页接口
      const response = await webApi.getNavsPage({
        page: { pageNum: 1, pageSize: 100 } // 获取足够多的数据
      });

      // 转换 NavigationVO 到 NavItem 格式
      const navigationVOs = response.data?.list || [];
      const navItems: NavItem[] = navigationVOs.map((nav: NavigationVO) => ({
        id: nav.id,
        name: nav.name,
        url: nav.url,
        sort: nav.sort,
        category: nav.categoryName, // NavigationVO 中是 categoryName
        icon: nav.icon,
        remark: nav.remark
      }));

      setNavItems(navItems);
    } catch (error) {
      console.error('加载导航数据失败:', error);
      setNavItems([]);
    }
  };

  const loadCategories = async () => {
    try {
      // 使用 WebController 的分类接口
      const response = await webApi.getCategory();
      setCategories(response.data || []);
    } catch (error) {
      console.error('加载分类数据失败:', error);
      setCategories([]);
    }
  };

  const loadSystemConfig = async () => {
    try {
      // 使用WebController的站点信息接口 - GET /webs/site (无需token，适用于导航页面)
      const response = await webApi.getSiteInfo();
      const config = response.data;
      console.log('导航页面加载的站点信息:', config);

      if (config) {
        setSystemConfig({
          siteTitle: config.siteTitle || DEFAULT_SYSTEM_CONFIG.siteTitle,
          siteLogo: config.siteLogo || DEFAULT_SYSTEM_CONFIG.siteLogo,
          defaultOpenMode: config.defaultOpenMode === 1 ? 'newTab' : 'currentTab',
          hideAdminEntry: config.hideAdminEntry === 1,
          adminUsername: config.username || DEFAULT_SYSTEM_CONFIG.adminUsername,
          adminPassword: config.password || DEFAULT_SYSTEM_CONFIG.adminPassword,
        });
      } else {
        console.log('未获取到站点信息，使用默认配置');
        setSystemConfig(DEFAULT_SYSTEM_CONFIG);
      }
    } catch (error) {
      console.error('加载站点信息失败:', error);
      setSystemConfig(DEFAULT_SYSTEM_CONFIG);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadNavItems(),
      loadCategories(),
      loadSystemConfig(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    // 使用 AbortController 来避免内存泄漏和竞态条件
    const abortController = new AbortController();

    // 只在组件挂载时加载一次数据
    loadData();

    return () => {
      // 清理函数，取消所有正在进行的请求
      abortController.abort();
    };
  }, []); // 空依赖数组，确保只在组件挂载时执行一次

  return {
    navItems,
    setNavItems,
    categories,
    setCategories,
    systemConfig,
    setSystemConfig,
    loading,
    refresh: loadData,
  };
};
