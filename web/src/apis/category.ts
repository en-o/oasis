import axios from 'axios';
const instance = axios.create({ baseURL: '/api' });

export const categoryApi = {
  list: () => instance.get<string[]>('/categories').then((r) => r.data),
  add: (name: string) => instance.post<string>('/categories', { name }),
  update: (index: number, name: string) =>
    instance.patch<string>(`/categories/${index}`, { name }),
  remove: (index: number) => instance.delete(`/categories/${index}`),
};