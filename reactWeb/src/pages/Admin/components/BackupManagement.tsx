import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Switch, message, Space, Tag, Descriptions, Modal } from 'antd';
import { SaveOutlined, SyncOutlined, PlayCircleOutlined, PauseCircleOutlined, ThunderboltOutlined, RollbackOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { backupApi } from '@/services/api';
import type { BackupConfig, BackupStatus } from '@/types';

const BackupManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [config, setConfig] = useState<BackupConfig | null>(null);
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [cronValidating, setCronValidating] = useState(false);

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
      if (response.code === 200) {
        message.success(response.message || '配置保存成功');
        await loadConfig();
        await loadStatus();
      } else {
        message.error(response.message || '配置保存失败');
      }
    } catch (error: any) {
      if (error.errorFields) {
        message.error('请检查表单填写');
      } else {
        message.error(error.message || '配置保存失败');
      }
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
      if (response.code === 200) {
        message.success(response.message || '连接测试成功');
      } else {
        message.error(response.message || '连接测试失败');
      }
    } catch (error: any) {
      if (error.errorFields) {
        message.error('请先填写数据库连接信息');
      } else {
        message.error(error.message || '连接测试失败');
      }
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
      if (response.code === 200) {
        message.success(response.data || 'Cron表达式格式正确');
      } else {
        message.error(response.message || 'Cron表达式格式错误');
      }
    } catch (error: any) {
      message.error(error.message || 'Cron表达式验证失败');
    } finally {
      setCronValidating(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const response = await backupApi.start();
      if (response.code === 200) {
        message.success(response.message || '定时备份已启动');
        await loadStatus();
      } else {
        message.error(response.message || '启动失败');
      }
    } catch (error: any) {
      message.error(error.message || '启动失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      const response = await backupApi.stop();
      if (response.code === 200) {
        message.success(response.message || '定时备份已停止');
        await loadStatus();
      } else {
        message.error(response.message || '停止失败');
      }
    } catch (error: any) {
      message.error(error.message || '停止失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteOnce = async () => {
    setLoading(true);
    try {
      const response = await backupApi.executeOnce();
      if (response.code === 200) {
        message.success(response.message || '备份任务已开始执行');
        setTimeout(() => {
          loadConfig();
          loadStatus();
        }, 2000);
      } else {
        message.error(response.message || '执行失败');
      }
    } catch (error: any) {
      message.error(error.message || '执行失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = () => {
    Modal.confirm({
      title: '确认恢复数据',
      content: '确定要从MySQL恢复数据到H2吗？这将覆盖当前数据！',
      okText: '确认恢复',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        setLoading(true);
        try {
          const response = await backupApi.restore();
          if (response.code === 200) {
            message.success(response.message || '数据恢复任务完成');
          } else {
            message.error(response.message || '恢复失败');
          }
        } catch (error: any) {
          message.error(error.message || '恢复失败');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* 备份状态卡片 */}
      <Card title="备份状态" extra={<Button icon={<SyncOutlined />} onClick={loadStatus}>刷新</Button>}>
        {status && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="运行状态">
              {status.isRunning ? (
                <Tag color="success" icon={<CheckCircleOutlined />}>运行中</Tag>
              ) : (
                <Tag color="default">已停止</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="当前时间">
              {new Date(status.currentTime).toLocaleString('zh-CN')}
            </Descriptions.Item>
            {status.schedule && (
              <Descriptions.Item label="定时表达式" span={2}>
                <code className="bg-gray-100 px-2 py-1 rounded">{status.schedule}</code>
              </Descriptions.Item>
            )}
            {status.targetUrl && (
              <Descriptions.Item label="目标地址" span={2}>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">{status.targetUrl}</code>
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

          <Form.Item
            label="定时表达式"
            name="schedule"
            extra="支持Cron表达式，例如: 0 0 2 * * ? (每天凌晨2点执行)"
          >
            <Space.Compact style={{ width: '100%' }}>
              <Input placeholder="0 0 2 * * ?" />
              <Button
                type="primary"
                onClick={handleValidateCron}
                loading={cronValidating}
              >
                验证
              </Button>
            </Space.Compact>
          </Form.Item>

          <Form.Item
            label="配置描述"
            name="description"
          >
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
              disabled={!config?.enabled || status?.isRunning}
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
            <p>• <strong>启动定时备份:</strong> 按照配置的定时表达式自动执行备份</p>
            <p>• <strong>立即执行备份:</strong> 立即执行一次H2到MySQL的数据备份</p>
            <p>• <strong>从MySQL恢复数据:</strong> 将MySQL中的数据恢复到H2数据库 (谨慎操作)</p>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default BackupManagement;