export interface NavItem {
  id: number;
  name: string;
  url: string;
  sort: number;
  categoryName: string;
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
  remark: string;
}

export interface SysConfig {
  id: number;
  configKey: string;
  configValue: string;
  remark: string;
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