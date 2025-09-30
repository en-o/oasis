import type { BackupConfig, BackupConfigAdd, BackupStatus, DatabaseConfig } from '@/types';
import axios from 'axios';

const instance = axios.create({ baseURL: '/api' });

// 通用响应类型
interface ResultVO<T> {
  code: number;
  message: string;
  data: T;
}

export const backupApi = {
  /** 保存备份配置 */
  saveConfig: (data: BackupConfigAdd) =>
    instance.post<ResultVO<string>>('/data/config', data).then((r) => r.data),

  /** 获取备份配置 */
  getConfig: () =>
    instance.get<ResultVO<BackupConfig>>('/data/config').then((r) => r.data),

  /** 启动定时备份 */
  start: () =>
    instance.post<ResultVO<string>>('/data/start').then((r) => r.data),

  /** 停止定时备份 */
  stop: () =>
    instance.post<ResultVO<string>>('/data/stop').then((r) => r.data),

  /** 立即执行一次备份 */
  executeOnce: () =>
    instance.post<ResultVO<string>>('/data/execute').then((r) => r.data),

  /** 获取备份状态 */
  getStatus: () =>
    instance.get<ResultVO<BackupStatus>>('/data/status').then((r) => r.data),

  /** 测试数据库连接 */
  testConnection: (config: DatabaseConfig) =>
    instance.post<ResultVO<string>>('/data/test-connection', config).then((r) => r.data),

  /** 验证Cron表达式 */
  validateCron: (cronExpression: string) =>
    instance.get<ResultVO<string>>('/data/validate-cron', {
      params: { cronExpression }
    }).then((r) => r.data),

  /** 从MySQL恢复数据到H2 */
  restore: () =>
    instance.post<ResultVO<string>>('/data/restore').then((r) => r.data),
};