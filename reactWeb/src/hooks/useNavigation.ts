import { useState, useEffect, useRef } from 'react';
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

  // 只需要防止并发调用，不需要防止重新加载
  const isLoadingRef = useRef(false);

  const loadNavItems = async () => {
    try {
      console.log('=== 开始调用导航接口 ===');

      const response = await webApi.getNavsPage({
        page: { pageNum: 1, pageSize: 100 }
      });

      console.log('导航接口响应:', response);

      // 检查响应结构
      if (!response || !response.data || !response.data.list) {
        console.error('导航接口响应结构异常:', response);
        setNavItems([]);
        return;
      }

      // NavigationVO 数组
      const navigationVOs = response.data.list;
      console.log('NavigationVO 数组:', navigationVOs);

      // 转换 NavigationVO 到 NavItem 格式
      const navItems: NavItem[] = navigationVOs.map((nav: NavigationVO) => ({
        id: nav.id,
        name: nav.name,
        url: nav.url,
        sort: nav.sort,
        category: nav.category, // NavigationVO 中就是 category 字段
        icon: nav.icon,
        remark: nav.remark
      }));

      console.log('转换后的 NavItem 数组:', navItems);
      setNavItems(navItems);

    } catch (error) {
      console.error('导航接口调用失败:', error);
      setNavItems([]);
    }
  };

  const loadCategories = async () => {
    try {
      console.log('=== 开始调用分类接口 ===');

      const response = await webApi.getCategory();
      console.log('分类接口响应:', response);

      // 检查响应结构
      if (!response || !response.data) {
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

      const response = await webApi.getSiteInfo();
      console.log('站点信息接口响应:', response);

      // 检查响应结构
      if (!response || !response.data) {
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
        defaultOpenMode: siteInfo.defaultOpenMode === 1 ? 'newTab' : 'currentTab',
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
    // 只防止并发调用，不阻止重新加载
    if (isLoadingRef.current) {
      console.log('数据正在加载中，跳过并发调用');
      return;
    }

    isLoadingRef.current = true;
    setLoading(true);

    try {
      console.log('开始加载导航数据...');
      await Promise.all([
        loadNavItems(),
        loadCategories(),
        loadSystemConfig(),
      ]);
      console.log('导航数据加载完成');
    } catch (error) {
      console.error('加载导航数据失败:', error);
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
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
