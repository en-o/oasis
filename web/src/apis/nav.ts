import type { NavItem } from '@/types';
import axios from 'axios';

const instance = axios.create({ baseURL: '/api' });

export const navApi = {
  /** 获取全部导航项 */
  list: () => instance.get<NavItem[]>('/nav').then((r) => r.data),

  /** 根据平台类型获取导航项 */
  listByPlatform: (showPlatform?: number) =>
    instance
      .get<NavItem[]>('/navigation/lists/platform', {
        params: { showPlatform },
      })
      .then((r) => r.data),

  /** 新增导航 */
  add: (data: Omit<NavItem, 'id'>) => instance.post<NavItem>('/nav', data),

  /** 更新导航 */
  update: (id: number, data: Partial<NavItem>) =>
    instance.patch<NavItem>(`/nav/${id}`, data),

  /** 删除导航 */
  remove: (id: number) => instance.delete(`/nav/${id}`),
};