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