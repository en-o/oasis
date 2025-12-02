import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import type { NavItem, NavCategory, SystemConfig, SitePublish } from '@/types';
import { webApi, navigationApi, sitePublishApi } from '@/services/api';

const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  siteTitle: 'Oasis 导航',
  siteLogo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzM5MzlmZiIvPgo8cGF0aCBkPSJNMTYgMTJMMjAgMTZMMTYgMjBMMTIgMTZMMTYgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
  defaultOpenMode: 'newTab',
  hideAdminEntry: false,
  adminUsername: 'admin',
  adminPassword: 'admin123',
};

export const useNavigation = () => {
  const location = useLocation();
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG);
  const [loading, setLoading] = useState(true);
  const [sitePublishConfig, setSitePublishConfig] = useState<SitePublish | null>(null);

  // 只需要防止并发调用，不需要防止重新加载
  const isLoadingRef = useRef(false);
  const prevNavItemsRef = useRef<NavItem[]>([]);

  // 添加调试：监听 navItems 状态变化
  useEffect(() => {
    console.log('=== navItems 状态变化 ===');
    prevNavItemsRef.current = navItems;
  }, [navItems]);

  const loadNavItems = async (showPlatform?: number | null) => {
    try {
      console.log('=== 开始调用导航接口 ===');
      console.log('showPlatform:', showPlatform);

      let navList: NavItem[] = [];

      // 如果有平台过滤，使用平台过滤接口
      if (showPlatform !== undefined && showPlatform !== null) {
        const response = await navigationApi.getListByPlatform(showPlatform);

        if (!response || response.code !== 200 || !response.data) {
          console.error('导航接口响应结构异常:', response);
          setNavItems([]);
          return;
        }

        navList = response.data
          .filter((nav: NavItem) => nav.status === 1)
          .map((nav: NavItem) => ({
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
            showPlatform: nav.showPlatform,
          }));
      } else {
        // 使用分页接口获取所有导航
        const response = await webApi.getNavsPage({
          page: { pageNum: 1, pageSize: 100 }
        });

        if (!response || response.code !== 200 || !response.data || !response.data.rows) {
          console.error('导航接口响应结构异常:', response);
          setNavItems([]);
          return;
        }

        navList = response.data.rows
          .filter((nav: any) => nav.status === 1)
          .map((nav: any) => ({
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
            showPlatform: nav.showPlatform,
          }));
      }

      setNavItems(navList);
      console.log('导航数据加载成功，数量:', navList.length);

    } catch (error) {
      console.error('导航接口调用失败:', error);
      setNavItems([]);
    }
  };

  const loadCategories = async () => {
    try {
      console.log('=== 开始调用分类接口 ===');

      const response = await webApi.getCategory();

      // 检查响应结构
      if (!response || response.code !== 200 || !response.data) {
        console.error('分类接口响应结构异常:', response);
        setCategories([]);
        return;
      }

      // NavCategory 数组
      const categoryList = response.data;

      setCategories(categoryList);

    } catch (error) {
      console.error('分类接口调用失败:', error);
      setCategories([]);
    }
  };

  const loadSystemConfig = async (sitePublish: SitePublish | null = null) => {
    try {
      console.log('=== 开始调用站点信息接口 ===');

      const response = await webApi.getSiteInfo();

      // 检查响应结构
      if (!response || response.code !== 200 || !response.data) {
        setSystemConfig(DEFAULT_SYSTEM_CONFIG);
        return;
      }

      // SiteInfo 对象
      const siteInfo = response.data;

      // 转换为 SystemConfig 格式
      // 如果有 SitePublish 配置，则使用其 hideAdminEntry，否则使用系统配置
      const hideAdminEntry = sitePublish
        ? sitePublish.hideAdminEntry
        : siteInfo.hideAdminEntry === 1;

      setSystemConfig({
        siteTitle: siteInfo.siteTitle || DEFAULT_SYSTEM_CONFIG.siteTitle,
        siteLogo: siteInfo.siteLogo || DEFAULT_SYSTEM_CONFIG.siteLogo,
        defaultOpenMode: siteInfo.defaultOpenMode === 0 ? 'currentTab' : 'newTab',
        hideAdminEntry: hideAdminEntry,
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
    console.log('当前路径:', location.pathname);

    // 只防止并发调用，不阻止重新加载
    if (isLoadingRef.current) {
      console.log('数据正在加载中，跳过并发调用');
      return;
    }

    console.log('开始设置 loading 状态...');
    isLoadingRef.current = true;
    setLoading(true);

    console.log('开始加载导航数据...');

    // 1. 获取 SitePublish 配置（如果路径不是根路径）
    let sitePublish: SitePublish | null = null;
    if (location.pathname !== '/' && location.pathname !== '/admin') {
      try {
        console.log('调用 sitePublishApi.getByRoutePath...');
        const response = await sitePublishApi.getByRoutePath(location.pathname);
        if (response.code === 200 && response.data && response.data.enabled) {
          sitePublish = response.data;
          setSitePublishConfig(sitePublish);
          console.log('SitePublish 配置加载成功:', sitePublish);
        } else {
          console.log('未找到启用的 SitePublish 配置，使用默认配置');
          setSitePublishConfig(null);
        }
      } catch (error) {
        console.error('加载 SitePublish 配置失败:', error);
        setSitePublishConfig(null);
      }
    } else {
      setSitePublishConfig(null);
    }

    // 2. 根据配置加载导航数据
    try {
      console.log('调用 loadNavItems...');
      await loadNavItems(sitePublish?.showPlatform);
    } catch (error) {
      console.error('loadNavItems 失败:', error);
    }

    // 3. 加载分类
    try {
      console.log('调用 loadCategories...');
      await loadCategories();
    } catch (error) {
      console.error('loadCategories 失败:', error);
    }

    // 4. 加载系统配置（传入 SitePublish 配置）
    try {
      console.log('调用 loadSystemConfig...');
      await loadSystemConfig(sitePublish);
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
  }, [location.pathname]); // 依赖路径变化，当路径改变时重新加载数据

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
    sitePublishConfig,
    loading,
    refresh,
  };
};
