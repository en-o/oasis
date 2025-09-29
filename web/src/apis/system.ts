import axios from 'axios';
import type { SystemConfig } from '@/types';

const instance = axios.create({ baseURL: '/api' });

export const systemApi = {
  get: () => instance.get<SystemConfig>('/system').then((r) => r.data),
  update: (data: Partial<SystemConfig>) =>
    instance.patch<SystemConfig>('/system', data),
};