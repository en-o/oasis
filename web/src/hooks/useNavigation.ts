import { useState } from 'react';
import {
  initialNavItems,
  initialCategories,
  initialSystemConfig,
} from '@/utils/mock';
import type { NavItem, SystemConfig } from '@/types';

export const useNavigation = () => {
  const [navItems, setNavItems] = useState<NavItem[]>(initialNavItems);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [systemConfig, setSystemConfig] =
    useState<SystemConfig>(initialSystemConfig);

  return {
    navItems,
    setNavItems,
    categories,
    setCategories,
    systemConfig,
    setSystemConfig,
  };
};