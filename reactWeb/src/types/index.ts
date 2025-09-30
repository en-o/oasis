export interface NavItem {
  id: number;
  name: string;
  url: string;
  sort: number;
  category: string;
  icon?: string;
  remark?: string;
  account?: string; // 登录账号
  password?: string; // 登录密码
  lookAccount: boolean;
  hasAccount: boolean; // 是否有账户信息（从后端安全返回）
  nvaAccessSecret?: string; // 查看密钥
  status: number; // 0=停用, 1=启用
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

// 后端返回结构 - 基础响应
export interface ResultVO<T = any> {
  code: number;
  message: string;
  data: T;
  ts: number;
  traceId?: string;
}

// 后端返回结构 - 分页数据
export interface PageResult<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  total: number;
  rows: T[];
}

// 后端返回结构 - 分页响应
export interface ResultPageVO<T> {
  code: number;
  message: string;
  data: PageResult<T>;
  ts: number;
  traceId?: string;
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
  category: string;
  icon?: string;
  remark?: string;
  lookAccount: boolean;
  hasAccount: boolean;
  status: number; // 0=停用, 1=启用
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

// 备份管理相关类型定义
export interface BackupConfig {
  id?: number;
  url: string;
  username: string;
  password: string;
  driverClassName?: string;
  schedule?: string;
  enabled?: boolean;
  description?: string;
  lastBackupTime?: string;
  backupCount?: number;
}

export interface BackupConfigAdd {
  url: string;
  username: string;
  password: string;
  schedule?: string;
  enabled?: boolean;
  description?: string;
}

export interface BackupStatus {
  isRunning: boolean;
  currentTime: string;
  schedule?: string;
  targetUrl?: string;
}

export interface DatabaseConfig {
  url: string;
  username: string;
  password: string;
  driverClassName: string;
}
