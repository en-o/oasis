import type { NavItem, SystemConfig } from '@/types';
// 模拟数据

export const initialNavItems: NavItem[] = [
  {
    id: 1,
    order: 1,
    name: 'Google',
    url: 'https://www.google.com',
    sort: 1,
    category: '搜索引擎',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiM0Mjg1RjQiLz48L3N2Zz4=',
    remark: 'Google搜索引擎',
    accountInfo: { account: 'user@gmail.com', password: 'password123' },
  },
  {
    id: 2,
    order: 2,
    name: 'GitHub',
    url: 'https://github.com',
    sort: 2,
    category: '开发工具',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMxODE3MWIiLz48L3N2Zz4=',
    remark: '代码托管平台',
    accountInfo: { account: 'developer', password: 'dev123' },
  },
];

export const initialCategories: string[] = ['搜索引擎', '开发工具', '社交媒体', '学习资源'];

export const initialSystemConfig: SystemConfig = {
  siteTitle: '我的导航',
  siteLogo:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSI+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTQiIGZpbGw9IiMzQjgyRjYiLz48L3N2Zz4=',
  defaultOpenMode: 'newTab',
  hideAdminEntry: false,
  user: { username: 'tan', password: '123' },
};