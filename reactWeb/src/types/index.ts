export interface NavItem {
  id: number;
  name: string;
  url: string;
  sort: number;
  category: string;
  icon: string;
  remark: string;
  accountInfo?: {
    account: string;
    password: string;
  };
}

export interface NavCategory {
  id: number;
  categoryName: string;
  sort: number;
}

export interface SysConfig {
  id: number;
  configKey: string;
  siteTitle: string;
  siteLogo: string;
  defaultOpenMode: number; // 0=当前页, 1=新标签页
  hideAdminEntry: number; // 0=显示, 1=隐藏
  username: string; // 管理员用户名
  password: string; // 管理员密码
}

export interface SystemConfig {
  siteTitle: string;
  siteLogo: string;
  defaultOpenMode: 'newTab' | 'currentTab';
  hideAdminEntry: boolean;
  adminUsername: string;
  adminPassword: string;
}

export interface LoginForm {
  username: string;
  password: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface PageRequest {
  page: number;
  size: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// WebController 相关类型定义
export interface SiteInfo {
  siteTitle: string;
  siteLogo: string;
  defaultOpenMode: number; // 0=当前页, 1=新标签页
  hideAdminEntry: number;  // 0=显示, 1=隐藏
}

export interface NavigationVO {
  id: number;
  name: string;
  url: string;
  sort: number;
  category: string;    // 注意：这里是 category，不是 categoryName
  icon: string;
  remark: string;
  lookAccount: boolean;
  nvaAccessSecret: string;
  status: number;      // 0=停用, 1=启用
}

export interface JpaPageResult<T> {
  list: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface NavigationPageRequest {
  name?: string;
  category?: string;
  page: {
    pageNum: number;
    pageSize: number;
  };
}

export interface NavAccessInfo {
  account: string;
  password: string;
}
