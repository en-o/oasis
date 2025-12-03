import request from '@/utils/request';
import type {
  NavItem,
  NavCategory,
  SysConfig,
  LoginForm,
  SiteInfo,
  NavigationVO,
  NavigationPageRequest,
  NavManagementPageRequest,
  NavAccessInfo,
  ResultVO,
  ResultPageVO,
  BackupConfig,
  BackupConfigAdd,
  BackupStatus,
  DatabaseConfig,
  SitePublish,
  SitePublishAdd,
  SitePublishEdit,
} from '@/types';

// Navigation APIs - 对应 NavigationController
export const navigationApi = {
  // 获取导航列表 - GET /navigation/lists
  getList: () => request.get<ResultVO<NavItem[]>>('/navigation/lists'),

  // 根据平台类型获取导航列表 - GET /navigation/lists/platform
  getListByPlatform: (platformPaths: string[]) => {
    // 将数组转换为逗号分隔的字符串
    const platformParam = platformPaths.join(',');
    return request.get<ResultVO<NavItem[]>>('/navigation/lists/platform', {
      params: { showPlatform: platformParam }
    });
  },

  // 分页查询导航 - POST /navigation/page
  getPage: (params: NavManagementPageRequest) => request.post<ResultPageVO<NavItem>>('/navigation/page', params),

  // 获取导航详情 - GET /navigation/{id}
  getDetail: (id: number) => request.get<ResultVO<NavItem>>(`/navigation/${id}`),

  // 新增导航 - POST /navigation/append
  create: (data: Omit<NavItem, 'id'>) => request.post<ResultVO<any>>('/navigation/append', data),

  // 编辑导航 - POST /navigation/edit
  update: (data: NavItem) => request.post<ResultVO<any>>('/navigation/edit', data),

  // 删除导航 - DELETE /navigation/delete?id={id}
  delete: (id: number) => request.delete<ResultVO<any>>(`/navigation/delete?id=${id}`),
};

// Category APIs - 对应 NavCategoryController
export const categoryApi = {
  // 获取分类列表 - GET /navCategory/lists
  getList: () => request.get<ResultVO<NavCategory[]>>('/navCategory/lists'),

  // 新增分类 - POST /navCategory/append
  create: (data: Omit<NavCategory, 'id'>) => request.post<ResultVO<any>>('/navCategory/append', data),

  // 删除分类 - DELETE /navCategory/delete?categoryName={categoryName}
  delete: (categoryName: string) => request.delete<ResultVO<any>>(`/navCategory/delete?categoryName=${categoryName}`),
};

// System Config APIs - 对应 SysConfigsController
export const sysConfigApi = {
  // 获取系统配置 - GET /sysConfigs/
  getConfig: () => request.get<ResultVO<SysConfig>>('/sysConfigs/'),

  // 编辑系统配置 - POST /sysConfigs/edit
  update: (data: SysConfig) => request.post<ResultVO<any>>('/sysConfigs/edit', data),
};

// Web APIs - 对应 WebController (前端导航页面接口)
export const webApi = {
  // 获取站点信息 - GET /webs/site (无需token)
  getSiteInfo: (routePath?: string) => {
    const params = routePath ? { routePath } : undefined;
    return request.get<ResultVO<SiteInfo>>('/webs/site', { params });
  },

  // 获取导航列表 - POST /webs/navs (无需token)
  getNavsPage: (params: NavigationPageRequest, routePath?: string) => {
    const queryParams = routePath ? { routePath } : undefined;
    return request.post<ResultPageVO<NavigationVO>>('/webs/navs', params, { params: queryParams });
  },

  // 获取导航访问信息 - GET /webs/navs/access/{id} (无需token)
  getNavAccess: (id: number, secret?: string) =>
    request.get<ResultVO<NavAccessInfo>>(`/webs/navs/access/${id}${secret ? `?nvaAccessSecret=${secret}` : ''}`),

  // 获取网站分类 - GET /webs/category (无需token)
  getCategory: () => request.get<ResultVO<NavCategory[]>>('/webs/category'),
};

// Login API - 对应 LoginController
export const authApi = {
  // 登录 - POST /login
  login: (data: LoginForm) => request.post<ResultVO<string>>('/login', data),

  // 初始化系统配置 - GET /init
  initSysConfig: () => request.get<ResultVO<boolean>>('/init'),
};

// Backup APIs - 对应 DataBackupController
export const backupApi = {
  // 保存备份配置 - POST /data/config
  saveConfig: (data: BackupConfigAdd) => request.post<ResultVO<string>>('/data/config', data),

  // 获取备份配置 - GET /data/config
  getConfig: () => request.get<ResultVO<BackupConfig>>('/data/config'),

  // 启动定时备份 - POST /data/start
  start: () => request.post<ResultVO<string>>('/data/start'),

  // 停止定时备份 - POST /data/stop
  stop: () => request.post<ResultVO<string>>('/data/stop'),

  // 立即执行一次备份 - POST /data/execute
  executeOnce: () => request.post<ResultVO<string>>('/data/execute'),

  // 获取备份状态 - GET /data/status
  getStatus: () => request.get<ResultVO<BackupStatus>>('/data/status'),

  // 测试数据库连接 - POST /data/test-connection
  testConnection: (config: DatabaseConfig) => request.post<ResultVO<string>>('/data/test-connection', config),

  // 验证Cron表达式 - GET /data/validate-cron
  validateCron: (cronExpression: string) =>
    request.get<ResultVO<string>>('/data/validate-cron', { params: { cronExpression } }),

  // 从MySQL恢复数据到H2 - POST /data/restore
  restore: () => request.post<ResultVO<string>>('/data/restore'),
};

// Site Publish APIs - 对应 SitePublishController
export const sitePublishApi = {
  // 获取所有配置 - GET /sitePublish/lists
  getList: () => request.get<ResultVO<SitePublish[]>>('/sitePublish/lists'),

  // 获取所有启用的配置 - GET /sitePublish/enabled
  getEnabled: () => request.get<ResultVO<SitePublish[]>>('/sitePublish/enabled'),

  // 根据路由路径获取配置 - GET /sitePublish/route/{routePath}
  getByRoutePath: (routePath: string) => {
    // 移除路径前的斜杠，因为后端期望没有斜杠的路径
    const path = routePath.startsWith('/') ? routePath.substring(1) : routePath;
    return request.get<ResultVO<SitePublish>>(`/sitePublish/route/${path}`);
  },

  // 新增配置 - POST /sitePublish/append
  create: (data: SitePublishAdd) => request.post<ResultVO<any>>('/sitePublish/append', data),

  // 更新配置 - PUT /sitePublish/update
  update: (data: SitePublishEdit) => request.put<ResultVO<any>>('/sitePublish/update', data),

  // 删除配置 - DELETE /sitePublish/delete/{id}
  delete: (id: number) => request.delete<ResultVO<any>>(`/sitePublish/delete/${id}`),
};
