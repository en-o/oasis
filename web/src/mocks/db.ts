import { factory, primaryKey } from '@mswjs/data';
import type { NavItem, SystemConfig } from '@/types';

export const db = factory({
  nav: {
    id: primaryKey(Number),
    order: Number,
    name: String,
    url: String,
    sort: Number,
    category: String,
    icon: String,
    remark: String,
    accountInfo: {
      account: String,
      password: String,
    },
  },
  category: {
    id: primaryKey(Number),
    name: String,
  },
  system: {
    id: primaryKey(() => 'singleton'),
    siteTitle: String,
    siteLogo: String,
    defaultOpenMode: String as any,
    hideAdminEntry: Boolean,
    user: {
      username: String,
      password: String,
    },
  },
});

// 初始化默认数据
if (db.system.findFirst({ where: { id: { equals: 'singleton' } } }) === null) {
  db.system.create({
    id: 'singleton',
    siteTitle: '我的导航',
    siteLogo:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSI+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTQiIGZpbGw9IiMzQjgyRjYiLz48L3N2Zz4=',
    defaultOpenMode: 'newTab',
    hideAdminEntry: false,
    user: { username: 'tan', password: '123' },
  });
}

// 初始化分类
const defaultCategories = ['搜索引擎', '开发工具', '社交媒体', '学习资源'];
defaultCategories.forEach((c, idx) => {
  if (!db.category.findFirst({ where: { name: { equals: c } } })) {
    db.category.create({ id: idx + 1, name: c });
  }
});

// 初始化导航
const defaultNavs: Omit<NavItem, 'id'>[] = [
  {
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
defaultNavs.forEach((n, idx) => {
  if (!db.nav.findFirst({ where: { name: { equals: n.name } } })) {
    db.nav.create({ ...n, id: idx + 1 });
  }
});