import type { SitePublish, SitePublishAdd, SitePublishEdit } from '@/types';
import axios from 'axios';

const instance = axios.create({ baseURL: '/api' });

export const sitePublishApi = {
  /** 获取全部配置 */
  list: () => instance.get<SitePublish[]>('/sitePublish/lists').then((r) => r.data),

  /** 获取启用的配置 */
  listEnabled: () =>
    instance.get<SitePublish[]>('/sitePublish/enabled').then((r) => r.data),

  /** 根据路由路径获取配置 */
  getByRoutePath: (routePath: string) =>
    instance
      .get<SitePublish>(`/sitePublish/route/${encodeURIComponent(routePath)}`)
      .then((r) => r.data),

  /** 根据ID获取配置 */
  getById: (id: number) =>
    instance.get<SitePublish>(`/sitePublish/${id}`).then((r) => r.data),

  /** 新增配置 */
  add: (data: SitePublishAdd) => instance.post<SitePublish>('/sitePublish/append', data),

  /** 更新配置 */
  update: (data: SitePublishEdit) =>
    instance.put<SitePublish>('/sitePublish/update', data),

  /** 删除配置 */
  remove: (id: number) => instance.delete(`/sitePublish/delete/${id}`),
};
