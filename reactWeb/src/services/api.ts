import request from '@/utils/request';
import type { NavItem, NavCategory, SysConfig, LoginForm, PageRequest, PageResponse } from '@/types';

// Navigation APIs
export const navigationApi = {
  // 获取导航列表
  getList: () => request.get<NavItem[]>('/navigation/lists'),

  // 分页查询导航
  getPage: (params: PageRequest & { name?: string; categoryName?: string }) =>
    request.post<PageResponse<NavItem>>('/navigation/page', params),

  // 获取导航详情
  getDetail: (id: number) => request.get<NavItem>(`/navigation/${id}`),

  // 新增导航
  create: (data: Omit<NavItem, 'id'>) => request.post('/navigation/append', data),

  // 编辑导航
  update: (data: NavItem) => request.post('/navigation/edit', data),

  // 删除导航
  delete: (id: number) => request.delete(`/navigation/delete?id=${id}`),
};

// Category APIs
export const categoryApi = {
  // 获取分类列表
  getList: () => request.get<NavCategory[]>('/navCategory/lists'),

  // 新增分类
  create: (data: Omit<NavCategory, 'id'>) => request.post('/navCategory/append', data),

  // 删除分类
  delete: (categoryName: string) => request.delete(`/navCategory/delete?categoryName=${categoryName}`),
};

// System Config APIs
export const sysConfigApi = {
  // 获取配置列表
  getList: () => request.get<SysConfig[]>('/sysConfigs/lists'),

  // 新增配置
  create: (data: Omit<SysConfig, 'id'>) => request.post('/sysConfigs/append', data),

  // 编辑配置
  update: (data: SysConfig) => request.post('/sysConfigs/edit', data),

  // 删除配置
  delete: (id: number) => request.delete(`/sysConfigs/delete?id=${id}`),
};

// Login API
export const authApi = {
  login: (data: LoginForm) => request.post<{ token: string }>('/login', data),

  logout: () => request.post('/logout'),
};