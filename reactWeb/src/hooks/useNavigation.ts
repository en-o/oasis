import { useState, useEffect, useRef } from 'react';
import type { NavItem, NavCategory, SystemConfig, NavigationVO, ResultPageVO, ResultVO, SiteInfo } from '@/types';
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

  // 只需要防止并发调用，不需要防止重新加载
  const isLoadingRef = useRef(false);
  const prevNavItemsRef = useRef<NavItem[]>([]);

  // 添加调试：监听 navItems 状态变化
  useEffect(() => {
    console.log('=== navItems 状态变化 ===');
    console.log('上一次 navItems 长度:', prevNavItemsRef.current.length);
    console.log('新的 navItems 长度:', navItems.length);
    console.log('新的 navItems 内容:', navItems);
    console.log('状态是否真的发生了变化:', navItems !== prevNavItemsRef.current);
    prevNavItemsRef.current = navItems;
  }, [navItems]);

  const loadNavItems = async () => {
    try {
      console.log('=== 开始调用导航接口 ===');

      const response: ResultPageVO<NavigationVO> = await webApi.getNavsPage({
        page: { pageNum: 1, pageSize: 100 }
      });

      console.log('导航接口响应:', response);

      // 检查响应结构
      if (!response || response.code !== 200 || !response.data || !response.data.rows) {
        console.error('导航接口响应结构异常:', response);
        setNavItems([]);
        return;
      }

      // NavigationVO 数组
      const navigationVOs = response.data.rows;
      console.log('NavigationVO 数组:', navigationVOs);

      // 转换 NavigationVO 到 NavItem 格式
      const convertedNavItems: NavItem[] = navigationVOs
        .filter((nav: NavigationVO) => nav.status === 1) // 只显示启用的导航项
        .map((nav: NavigationVO) => {
          const navItem: NavItem = {
            id: nav.id,
            name: nav.name,
            url: nav.url,
            sort: nav.sort,
            category: nav.category,
            icon: nav.icon,
            remark: nav.remark,
            lookAccount: nav.lookAccount,
            hasAccount: nav.hasAccount,
            status: nav.status,
          };

          return navItem;
        });

      console.log('转换后的 NavItem 数组:', convertedNavItems);
      console.log('调用 setNavItems，数组长度:', convertedNavItems.length);
      setNavItems(convertedNavItems);

    } catch (error) {
      console.error('导航接口调用失败:', error);
      setNavItems([]);
    }
  };

  const loadCategories = async () => {
    try {
      console.log('=== 开始调用分类接口 ===');

      const response: ResultVO<NavCategory[]> = await webApi.getCategory();
      console.log('分类接口响应:', response);

      // 检查响应结构
      if (!response || response.code !== 200 || !response.data) {
        console.error('分类接口响应结构异常:', response);
        setCategories([]);
        return;
      }

      // NavCategory 数组
      const categoryList = response.data;
      console.log('NavCategory 数组:', categoryList);

      setCategories(categoryList);

    } catch (error) {
      console.error('分类接口调用失败:', error);
      setCategories([]);
    }
  };

  const loadSystemConfig = async () => {
    try {
      console.log('=== 开始调用站点信息接口 ===');

      const response: ResultVO<SiteInfo> = await webApi.getSiteInfo();
      console.log('站点信息接口响应:', response);

      // 检查响应结构
      if (!response || response.code !== 200 || !response.data) {
        console.error('站点信息接口响应结构异常:', response);
        setSystemConfig(DEFAULT_SYSTEM_CONFIG);
        return;
      }

      // SiteInfo 对象
      const siteInfo = response.data;
      console.log('SiteInfo 对象:', siteInfo);

      // 转换为 SystemConfig 格式
      setSystemConfig({
        siteTitle: siteInfo.siteTitle || DEFAULT_SYSTEM_CONFIG.siteTitle,
        siteLogo: siteInfo.siteLogo || DEFAULT_SYSTEM_CONFIG.siteLogo,
        defaultOpenMode: siteInfo.defaultOpenMode === 0 ? 'currentTab' : 'newTab',
        hideAdminEntry: siteInfo.hideAdminEntry === 1,
        adminUsername: DEFAULT_SYSTEM_CONFIG.adminUsername,
        adminPassword: DEFAULT_SYSTEM_CONFIG.adminPassword,
      });

    } catch (error) {
      console.error('站点信息接口调用失败:', error);
      setSystemConfig(DEFAULT_SYSTEM_CONFIG);
    }
  };

  const loadData = async () => {
    console.log('=== loadData 函数被调用 ===');
    console.log('isLoadingRef.current:', isLoadingRef.current);

    // 只防止并发调用，不阻止重新加载
    if (isLoadingRef.current) {
      console.log('数据正在加载中，跳过并发调用');
      return;
    }

    console.log('开始设置 loading 状态...');
    isLoadingRef.current = true;
    setLoading(true);

    console.log('开始加载导航数据...');

    // 独立调用三个接口，避免相互影响
    try {
      console.log('调用 loadNavItems...');
      await loadNavItems();
    } catch (error) {
      console.error('loadNavItems 失败:', error);
    }

    try {
      console.log('调用 loadCategories...');
      await loadCategories();
    } catch (error) {
      console.error('loadCategories 失败:', error);
    }

    try {
      console.log('调用 loadSystemConfig...');
      await loadSystemConfig();
    } catch (error) {
      console.error('loadSystemConfig 失败:', error);
    }

    console.log('导航数据加载完成');
    isLoadingRef.current = false;
    setLoading(false);
  };

  useEffect(() => {
    console.log('useNavigation hook useEffect 执行');
    loadData();

    return () => {
      // 清理函数，重置加载标志
      isLoadingRef.current = false;
      console.log('useNavigation hook 清理完成');
    };
  }, []); // 空依赖数组，确保只在组件挂载时执行一次

  // 提供刷新功能
  const refresh = async () => {
    console.log('手动刷新导航数据');
    await loadData();
  };

  return {
    navItems,
    setNavItems,
    categories,
    setCategories,
    systemConfig,
    setSystemConfig,
    loading,
    refresh,
  };
};
