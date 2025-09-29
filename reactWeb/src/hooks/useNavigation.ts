import { useState, useEffect } from 'react';
import type { NavItem, NavCategory, SystemConfig } from '@/types';
import { navigationApi, categoryApi, sysConfigApi } from '@/services/api';

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
      const response = await navigationApi.getList();
      setNavItems(response.data || []);
    } catch (error) {
      console.error('加载导航数据失败:', error);
      // 全局错误已在request.ts中处理，此处不需要再显示
      setNavItems([]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryApi.getList();
      setCategories(response.data || []);
    } catch (error) {
      console.error('加载分类数据失败:', error);
      // 全局错误已在request.ts中处理，此处不需要再显示
      setCategories([]);
    }
  };

  const loadSystemConfig = async () => {
    try {
      // 调用新的API接口 - GET /sysConfigs/
      const response = await sysConfigApi.getConfig();
      const config = response.data;
      console.log('导航页面加载的系统配置:', config);

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
        console.log('未获取到系统配置，使用默认配置');
        setSystemConfig(DEFAULT_SYSTEM_CONFIG);
      }
    } catch (error) {
      console.error('加载系统配置失败:', error);
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
    loadData();
  }, []);

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