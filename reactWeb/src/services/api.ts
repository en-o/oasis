import request from '@/utils/request';
import type {
  NavItem,
  NavCategory,
  SysConfig,
  LoginForm,
  SiteInfo,
  NavigationVO,
  NavigationPageRequest,
  NavAccessInfo,
  ResultVO,
  ResultPageVO,
} from '@/types';

// Navigation APIs - 对应 NavigationController
export const navigationApi = {
  // 获取导航列表 - GET /navigation/lists
  getList: () => request.get<ResultVO<NavItem[]>>('/navigation/lists'),

  // 分页查询导航 - POST /navigation/page (如果有分页接口)
  // getPage: (params: any) => request.post<ResultPageVO<NavItem>>('/navigation/page', params),

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
  getSiteInfo: () => request.get<ResultVO<SiteInfo>>('/webs/site'),

  // 获取导航列表 - POST /webs/navs (无需token)
  getNavsPage: (params: NavigationPageRequest) =>
    request.post<ResultPageVO<NavigationVO>>('/webs/navs', params),

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
