import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Space,
  Tag,
  Descriptions,
  Modal,
  Select,
  Radio,
  App,
} from 'antd';
import {
  SaveOutlined,
  SyncOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ThunderboltOutlined,
  RollbackOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { backupApi } from '@/services/api';
import type { BackupConfig, BackupStatus } from '@/types';

// 常用定时表达式预设
const CRON_PRESETS = [
  { label: '每天凌晨2点', value: '0 0 2 * * ?' },
  { label: '每天凌晨3点', value: '0 0 3 * * ?' },
  { label: '每天中午12点', value: '0 0 12 * * ?' },
  { label: '每天晚上8点', value: '0 0 20 * * ?' },
  { label: '每12小时', value: '0 0 */12 * * ?' },
  { label: '每6小时', value: '0 0 */6 * * ?' },
  { label: '每小时', value: '0 0 * * * ?' },
  { label: '每周日凌晨2点', value: '0 0 2 ? * SUN' },
  { label: '每月1号凌晨2点', value: '0 0 2 1 * ?' },
  { label: '自定义', value: 'custom' },
];

const BackupManagement: React.FC = () => {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const [config, setConfig] = useState<BackupConfig | null>(null);
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [cronValidating, setCronValidating] = useState(false);
  const [cronMode, setCronMode] = useState<'preset' | 'custom'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<string>('0 0 2 * * ?');

  // 加载配置和状态
  useEffect(() => {
    loadConfig();
    loadStatus();
    // 每30秒刷新一次状态
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadConfig = async () => {
    try {
      const response = await backupApi.getConfig();
      if (response.code === 200 && response.data) {
        setConfig(response.data);
        form.setFieldsValue(response.data);
        // 检查是否是预设的cron表达式
        if (response.data.schedule) {
          const preset = CRON_PRESETS.find(
            (p) => p.value === response.data.schedule
          );
          if (preset && preset.value !== 'custom') {
            setCronMode('preset');
            setSelectedPreset(preset.value);
          } else {
            setCronMode('custom');
          }
        }
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  };

  const loadStatus = async () => {
    try {
      const response = await backupApi.getStatus();
      if (response.code === 200 && response.data) {
        setStatus(response.data);
      }
    } catch (error) {
      console.error('加载状态失败:', error);
    }
  };

  const handleSaveConfig = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      setLoading(true);
      const response = await backupApi.saveConfig(values);
      message.success(response.message || '配置保存成功');
      await loadConfig();
      await loadStatus();
    } catch (error: any) {
      if (error.errorFields) {
        message.error('请检查表单填写');
      }
      // 网络错误已由拦截器处理，不需要额外处理
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      await form.validateFields(['url', 'username', 'password']);
      const values = form.getFieldsValue(['url', 'username', 'password']);
      setTestLoading(true);
      const response = await backupApi.testConnection({
        ...values,
        driverClassName: 'com.mysql.cj.jdbc.Driver',
      });
      message.success(response.message || '连接测试成功');
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setTestLoading(false);
    }
  };

  const handleValidateCron = async () => {
    try {
      const schedule = form.getFieldValue('schedule');
      if (!schedule) {
        message.warning('请输入定时表达式');
        return;
      }
      setCronValidating(true);
      const response = await backupApi.validateCron(schedule);
      message.success(response.data || 'Cron表达式格式正确');
    } catch (error: any) {
      message.error(error.message);
      // 错误已由拦截器处理
    } finally {
      setCronValidating(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const response = await backupApi.start();
      message.success(response.message || '定时备份已启动');
      await loadStatus();
    } catch (error) {
      // 错误已由拦截器处理
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      const response = await backupApi.stop();
      message.success(response.message || '定时备份已停止');
      await loadStatus();
    } catch (error) {
      // 错误已由拦截器处理
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteOnce = async () => {
    setLoading(true);
    try {
      const response = await backupApi.executeOnce();
      message.success(response.message || '备份任务已开始执行');
      setTimeout(() => {
        loadConfig();
        loadStatus();
      }, 2000);
    } catch (error) {
      // 错误已由拦截器处理
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = () => {
    modal.confirm({
      title: '确认恢复数据',
      content: '确定要从MySQL恢复数据到H2吗？这将覆盖当前数据！',
      okText: '确认恢复',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        setLoading(true);
        try {
          const response = await backupApi.restore();
          message.success(response.message || '数据恢复任务完成');
        } catch (error) {
          // 错误已由拦截器处理
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* 备份状态卡片 */}
      <Card
        title="备份状态"
        extra={
          <Button icon={<SyncOutlined />} onClick={loadStatus}>
            刷新
          </Button>
        }
      >
        {status && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="运行状态">
              {status.isRunning ? (
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  运行中
                </Tag>
              ) : (
                <Tag color="default">已停止</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="当前时间">
              {new Date(status.currentTime).toLocaleString('zh-CN')}
            </Descriptions.Item>
            {status.schedule && (
              <Descriptions.Item label="定时表达式" span={2}>
                <code className="bg-gray-100 px-2 py-1 rounded">
                  {status.schedule}
                </code>
              </Descriptions.Item>
            )}
            {status.targetUrl && (
              <Descriptions.Item label="目标地址" span={2}>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {status.targetUrl}
                </code>
              </Descriptions.Item>
            )}
            {config?.lastBackupTime && (
              <>
                <Descriptions.Item label="最后备份时间" span={2}>
                  {new Date(config.lastBackupTime).toLocaleString('zh-CN')}
                </Descriptions.Item>
                <Descriptions.Item label="备份次数" span={2}>
                  <Tag color="blue">{config.backupCount || 0} 次</Tag>
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Card>

      {/* 备份配置卡片 */}
      <Card title="备份配置">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            schedule: '0 0 2 * * ?',
            enabled: false,
            description: '数据备份到MySQL',
          }}
        >
          <Form.Item
            label="数据库连接地址"
            name="url"
            rules={[{ required: true, message: '请输入数据库连接地址' }]}
            extra="格式: jdbc:mysql://host:port/database"
          >
            <Input placeholder="jdbc:mysql://localhost:3306/oasis" />
          </Form.Item>

          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="root" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入数据库密码" />
          </Form.Item>

          <Form.Item label="定时表达式">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio.Group
                value={cronMode}
                onChange={(e) => {
                  const mode = e.target.value;
                  setCronMode(mode);
                  if (mode === 'preset') {
                    form.setFieldValue('schedule', selectedPreset);
                  }
                }}
              >
                <Radio value="preset">使用预设</Radio>
                <Radio value="custom">自定义</Radio>
              </Radio.Group>

              {cronMode === 'preset' ? (
                <Form.Item name="schedule" noStyle>
                  <Select
                    value={selectedPreset}
                    onChange={(value) => {
                      setSelectedPreset(value);
                      form.setFieldValue('schedule', value);
                    }}
                    style={{ width: '100%' }}
                    options={CRON_PRESETS.filter(
                      (p) => p.value !== 'custom'
                    ).map((p) => ({
                      label: `${p.label} (${p.value})`,
                      value: p.value,
                    }))}
                  />
                </Form.Item>
              ) : (
                <Space.Compact style={{ width: '100%' }}>
                  <Form.Item name="schedule" noStyle>
                    <Input placeholder="0 0 2 * * ?" />
                  </Form.Item>
                  <Button
                    type="primary"
                    onClick={handleValidateCron}
                    loading={cronValidating}
                  >
                    验证
                  </Button>
                </Space.Compact>
              )}

              <div className="text-xs text-gray-500">
                支持Cron表达式，例如: 0 0 2 * * ? (每天凌晨2点执行)
              </div>
            </Space>
          </Form.Item>

          <Form.Item label="配置描述" name="description">
            <Input placeholder="数据备份到MySQL" />
          </Form.Item>

          <Form.Item
            label="启用定时备份"
            name="enabled"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="default"
                icon={<CheckCircleOutlined />}
                onClick={handleTestConnection}
                loading={testLoading}
              >
                测试连接
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveConfig}
                loading={loading}
              >
                保存配置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 备份操作卡片 */}
      <Card title="备份操作">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space wrap>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleStart}
              loading={loading}
              disabled={status?.isRunning}
            >
              启动定时备份
            </Button>
            <Button
              danger
              icon={<PauseCircleOutlined />}
              onClick={handleStop}
              loading={loading}
              disabled={!status?.isRunning}
            >
              停止定时备份
            </Button>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={handleExecuteOnce}
              loading={loading}
              disabled={!config?.url}
            >
              立即执行备份
            </Button>
            <Button
              danger
              icon={<RollbackOutlined />}
              onClick={handleRestore}
              loading={loading}
              disabled={!config?.url}
            >
              从MySQL恢复数据
            </Button>
          </Space>

          <div className="text-sm text-gray-500 mt-4 space-y-1">
            <p>
              • <strong>启动定时备份:</strong> 按照配置的定时表达式自动执行备份
            </p>
            <p>
              • <strong>立即执行备份:</strong> 立即执行一次H2到MySQL的数据备份
            </p>
            <p>
              • <strong>从MySQL恢复数据:</strong> 将MySQL中的数据恢复到H2数据库
              (谨慎操作)
            </p>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default BackupManagement;
