export interface AccountInfo {
  account: string;
  password: string;
}

export interface NavItem {
  id: number;
  order: number;
  name: string;
  url: string;
  sort: number;
  category: string;
  icon: string;
  remark: string;
  accountInfo: AccountInfo;
}

export interface SystemConfig {
  siteTitle: string;
  siteLogo: string;
  defaultOpenMode: 'newTab' | 'currentTab';
  hideAdminEntry: boolean;
  user: { username: string; password: string };
}

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