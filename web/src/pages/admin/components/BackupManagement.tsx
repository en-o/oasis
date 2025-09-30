import React, { useState, useEffect } from 'react';
import { backupApi } from '@/apis';
import type { BackupConfig, BackupStatus } from '@/types';

const BackupManagement: React.FC = () => {
  const [config, setConfig] = useState<BackupConfig>({
    url: '',
    username: '',
    password: '',
    schedule: '0 0 2 * * ?',
    enabled: false,
    description: '数据备份到MySQL',
  });
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [cronValid, setCronValid] = useState<boolean | null>(null);

  // 加载配置和状态
  useEffect(() => {
    loadConfig();
    loadStatus();
  }, []);

  const loadConfig = async () => {
    try {
      const result = await backupApi.getConfig();
      if (result.code === 200 && result.data) {
        setConfig(result.data);
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  };

  const loadStatus = async () => {
    try {
      const result = await backupApi.getStatus();
      if (result.code === 200 && result.data) {
        setStatus(result.data);
      }
    } catch (error) {
      console.error('加载状态失败:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      const result = await backupApi.saveConfig(config);
      if (result.code === 200) {
        showMessage('success', result.message || '配置保存成功');
        await loadConfig();
        await loadStatus();
      } else {
        showMessage('error', result.message || '配置保存失败');
      }
    } catch (error: any) {
      showMessage('error', error.message || '配置保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const result = await backupApi.testConnection({
        url: config.url,
        username: config.username,
        password: config.password,
        driverClassName: 'com.mysql.cj.jdbc.Driver',
      });
      if (result.code === 200) {
        showMessage('success', result.message || '连接测试成功');
      } else {
        showMessage('error', result.message || '连接测试失败');
      }
    } catch (error: any) {
      showMessage('error', error.message || '连接测试失败');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateCron = async () => {
    if (!config.schedule) {
      setCronValid(null);
      return;
    }
    try {
      const result = await backupApi.validateCron(config.schedule);
      setCronValid(result.code === 200);
      if (result.code === 200) {
        showMessage('success', result.data || 'Cron表达式格式正确');
      } else {
        showMessage('error', result.message || 'Cron表达式格式错误');
      }
    } catch (error) {
      setCronValid(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const result = await backupApi.start();
      if (result.code === 200) {
        showMessage('success', result.message || '定时备份已启动');
        await loadStatus();
      } else {
        showMessage('error', result.message || '启动失败');
      }
    } catch (error: any) {
      showMessage('error', error.message || '启动失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      const result = await backupApi.stop();
      if (result.code === 200) {
        showMessage('success', result.message || '定时备份已停止');
        await loadStatus();
      } else {
        showMessage('error', result.message || '停止失败');
      }
    } catch (error: any) {
      showMessage('error', error.message || '停止失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteOnce = async () => {
    setLoading(true);
    try {
      const result = await backupApi.executeOnce();
      if (result.code === 200) {
        showMessage('success', result.message || '备份任务已开始执行');
        setTimeout(loadConfig, 2000);
      } else {
        showMessage('error', result.message || '执行失败');
      }
    } catch (error: any) {
      showMessage('error', error.message || '执行失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!confirm('确定要从MySQL恢复数据到H2吗? 这将覆盖当前数据!')) {
      return;
    }
    setLoading(true);
    try {
      const result = await backupApi.restore();
      if (result.code === 200) {
        showMessage('success', result.message || '数据恢复任务完成');
      } else {
        showMessage('error', result.message || '恢复失败');
      }
    } catch (error: any) {
      showMessage('error', error.message || '恢复失败');
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = <K extends keyof BackupConfig>(
    key: K,
    value: BackupConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* 消息提示 */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 备份状态 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">备份状态</h2>
        {status && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">运行状态:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  status.isRunning
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {status.isRunning ? '运行中' : '已停止'}
              </span>
            </div>
            {status.schedule && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">定时表达式:</span>
                <span className="font-mono text-sm">{status.schedule}</span>
              </div>
            )}
            {status.targetUrl && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">目标地址:</span>
                <span className="text-sm truncate max-w-md">{status.targetUrl}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-gray-600">当前时间:</span>
              <span className="text-sm">{new Date(status.currentTime).toLocaleString()}</span>
            </div>
          </div>
        )}
        {config.lastBackupTime && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">最后备份时间:</span>
              <span className="text-sm">{new Date(config.lastBackupTime).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-600">备份次数:</span>
              <span className="text-sm font-medium">{config.backupCount || 0} 次</span>
            </div>
          </div>
        )}
      </div>

      {/* 备份配置 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6">备份配置</h2>
        <div className="space-y-4">
          <div>
            <label className="form-label">数据库连接地址 *</label>
            <input
              type="text"
              className="form-input"
              value={config.url}
              onChange={(e) => updateConfig('url', e.target.value)}
              placeholder="jdbc:mysql://localhost:3306/oasis"
            />
            <div className="text-xs text-gray-500 mt-1">
              格式: jdbc:mysql://host:port/database
            </div>
          </div>

          <div>
            <label className="form-label">用户名 *</label>
            <input
              type="text"
              className="form-input"
              value={config.username}
              onChange={(e) => updateConfig('username', e.target.value)}
              placeholder="root"
            />
          </div>

          <div>
            <label className="form-label">密码 *</label>
            <input
              type="password"
              className="form-input"
              value={config.password}
              onChange={(e) => updateConfig('password', e.target.value)}
              placeholder="请输入数据库密码"
            />
          </div>

          <div>
            <label className="form-label">定时表达式</label>
            <div className="flex gap-2">
              <input
                type="text"
                className={`form-input flex-1 ${
                  cronValid === false ? 'border-red-500' : ''
                } ${cronValid === true ? 'border-green-500' : ''}`}
                value={config.schedule}
                onChange={(e) => {
                  updateConfig('schedule', e.target.value);
                  setCronValid(null);
                }}
                placeholder="0 0 2 * * ?"
              />
              <button
                onClick={handleValidateCron}
                className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                disabled={loading}
              >
                验证
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              支持Cron表达式，例如: 0 0 2 * * ? (每天凌晨2点执行)
            </div>
          </div>

          <div>
            <label className="form-label">配置描述</label>
            <input
              type="text"
              className="form-input"
              value={config.description}
              onChange={(e) => updateConfig('description', e.target.value)}
              placeholder="数据备份到MySQL"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enabled"
              checked={config.enabled}
              onChange={(e) => updateConfig('enabled', e.target.checked)}
            />
            <label htmlFor="enabled" className="text-sm font-medium">
              启用定时备份
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleTestConnection}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              disabled={loading || !config.url || !config.username || !config.password}
            >
              {loading ? '测试中...' : '测试连接'}
            </button>
            <button
              onClick={handleSaveConfig}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              disabled={loading || !config.url || !config.username || !config.password}
            >
              {loading ? '保存中...' : '保存配置'}
            </button>
          </div>
        </div>
      </div>

      {/* 备份操作 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6">备份操作</h2>
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleStart}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              disabled={loading || !config.enabled || status?.isRunning}
            >
              启动定时备份
            </button>
            <button
              onClick={handleStop}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              disabled={loading || !status?.isRunning}
            >
              停止定时备份
            </button>
            <button
              onClick={handleExecuteOnce}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              disabled={loading || !config.url}
            >
              立即执行备份
            </button>
            <button
              onClick={handleRestore}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              disabled={loading || !config.url}
            >
              从MySQL恢复数据
            </button>
          </div>
          <div className="text-sm text-gray-500">
            <p>• 启动定时备份: 按照配置的定时表达式自动执行备份</p>
            <p>• 立即执行备份: 立即执行一次H2到MySQL的数据备份</p>
            <p>• 从MySQL恢复数据: 将MySQL中的数据恢复到H2数据库 (谨慎操作)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupManagement;