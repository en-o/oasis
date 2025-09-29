import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Space } from 'antd';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { SysConfig } from '@/types';
import { sysConfigApi } from '@/services/api';

const SystemManagement: React.FC = () => {
  const [configs, setConfigs] = useState<SysConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SysConfig | null>(null);
  const [form] = Form.useForm();

  const predefinedConfigs = [
    { key: 'siteTitle', label: '网站标题', type: 'text' },
    { key: 'siteLogo', label: '网站Logo', type: 'text' },
    { key: 'defaultOpenMode', label: '默认打开方式', type: 'select', options: [
      { label: '新标签页', value: 'newTab' },
      { label: '当前标签页', value: 'currentTab' },
    ]},
    { key: 'hideAdminEntry', label: '隐藏管理入口', type: 'select', options: [
      { label: '显示', value: 'false' },
      { label: '隐藏', value: 'true' },
    ]},
    { key: 'adminUsername', label: '管理员账号', type: 'text' },
    { key: 'adminPassword', label: '管理员密码', type: 'password' },
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await sysConfigApi.getList();
      setConfigs(response.data || []);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    setEditingConfig(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (config: SysConfig) => {
    setEditingConfig(config);
    form.setFieldsValue(config);
    setModalVisible(true);
  };

  const handleSubmit = async (values: Omit<SysConfig, 'id'>) => {
    try {
      if (editingConfig) {
        await sysConfigApi.update({ ...editingConfig, ...values });
        message.success('更新成功');
      } else {
        await sysConfigApi.create(values);
        message.success('添加成功');
      }

      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error(editingConfig ? '更新失败' : '添加失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await sysConfigApi.delete(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const getConfigInfo = (configKey: string) => {
    return predefinedConfigs.find(config => config.key === configKey);
  };

  const columns = [
    {
      title: '配置项',
      dataIndex: 'configKey',
      key: 'configKey',
      render: (key: string) => {
        const info = getConfigInfo(key);
        return info ? info.label : key;
      },
    },
    {
      title: '配置值',
      dataIndex: 'configValue',
      key: 'configValue',
      render: (value: string, record: SysConfig) => {
        if (record.configKey === 'adminPassword') {
          return '***';
        }
        return value;
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: SysConfig) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该配置吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<Trash2 className="w-4 h-4" />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderConfigInput = (configKey: string) => {
    const info = getConfigInfo(configKey);

    if (!info) {
      return <Input placeholder="请输入配置值" />;
    }

    switch (info.type) {
      case 'select':
        return (
          <Select placeholder="请选择配置值">
            {info.options?.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        );
      case 'password':
        return <Input.Password placeholder="请输入配置值" />;
      default:
        return <Input placeholder="请输入配置值" />;
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">系统配置</h2>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleAdd}
        >
          添加配置
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={configs}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      <Modal
        title={editingConfig ? '编辑配置' : '添加配置'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="configKey"
            label="配置项"
            rules={[{ required: true, message: '请输入配置项' }]}
          >
            <Select
              placeholder="请选择或输入配置项"
              showSearch
              filterOption={false}
            >
              {predefinedConfigs.map(config => (
                <Select.Option key={config.key} value={config.key}>
                  {config.label} ({config.key})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="configValue"
            label="配置值"
            rules={[{ required: true, message: '请输入配置值' }]}
          >
            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.configKey !== curr.configKey}>
              {({ getFieldValue }) => renderConfigInput(getFieldValue('configKey'))}
            </Form.Item>
          </Form.Item>

          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="配置描述信息" />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingConfig ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SystemManagement;