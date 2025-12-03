import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Popconfirm, Space, App, Tag, Alert, Tooltip } from 'antd';
import { Plus, Edit, Trash2, Globe, Star, StarOff } from 'lucide-react';
import type { SitePublish } from '@/types';
import { sitePublishApi } from '@/services/api';

const SitePublishManagement: React.FC = () => {
  const { message } = App.useApp();
  const [sitePublishList, setSitePublishList] = useState<SitePublish[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<SitePublish | null>(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await sitePublishApi.getList();
      if (response.code === 200 && response.data) {
        setSitePublishList(response.data);
      } else {
        console.error('页面发布接口响应异常:', response);
        setSitePublishList([]);
      }
    } catch (error) {
      console.error('加载页面发布数据失败:', error);
      setSitePublishList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    // 设置默认值
    form.setFieldsValue({
      hideAdminEntry: false,
      enabled: true,
      sort: 1,
    });
    setModalVisible(true);
  };

  const handleEdit = (item: SitePublish) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingItem) {
        // 如果是默认页且尝试禁用，提示错误
        if (editingItem.defPage && !values.enabled) {
          message.error('默认页不允许禁用，请先设置其他页面为默认页');
          return;
        }
        await sitePublishApi.update({ ...values, id: editingItem.id });
        message.success('更新成功');
      } else {
        await sitePublishApi.create(values);
        message.success('添加成功');
      }

      setModalVisible(false);
      loadData();
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      console.error('页面发布操作失败:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await sitePublishApi.delete(id);
      message.success('删除成功');
      loadData();
    } catch (error: any) {
      console.error('删除页面发布配置失败:', error);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await sitePublishApi.setDefaultPage(id);
      message.success('设置默认页成功');
      loadData();
    } catch (error: any) {
      console.error('设置默认页失败:', error);
    }
  };

  const columns = [
    {
      title: '页面名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (name: string) => <span className="font-medium">{name}</span>,
    },
    {
      title: '路由路径',
      dataIndex: 'routePath',
      key: 'routePath',
      width: 150,
      render: (path: string) => (
        <code className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-mono text-xs">
          /{path}
        </code>
      ),
    },
    {
      title: '默认页',
      dataIndex: 'defPage',
      key: 'defPage',
      width: 100,
      align: 'center' as const,
      render: (value: boolean, record: SitePublish) => {
        if (value) {
          return (
            <Tooltip title="当前默认页">
              <div className="flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
            </Tooltip>
          );
        }
        return (
          <Tooltip title={record.enabled ? "点击设为默认页" : "请先启用该页面"}>
            <div
              className={`flex items-center justify-center ${
                record.enabled
                  ? 'cursor-pointer hover:bg-yellow-50 rounded-full p-1 transition-colors'
                  : 'cursor-not-allowed opacity-40'
              }`}
              onClick={() => record.enabled && handleSetDefault(record.id!)}
            >
              <StarOff className="w-5 h-5 text-gray-400" />
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: '管理入口',
      dataIndex: 'hideAdminEntry',
      key: 'hideAdminEntry',
      width: 100,
      align: 'center' as const,
      render: (value: boolean) => (
        <Tag color={value ? 'orange' : 'green'} className="m-0">
          {value ? '隐藏' : '显示'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      align: 'center' as const,
      render: (value: boolean, record: SitePublish) => (
        <Tooltip title={record.defPage && value ? "默认页不允许禁用" : ""}>
          <Tag color={value ? 'success' : 'default'} className="m-0">
            {value ? '启用' : '禁用'}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 70,
      align: 'center' as const,
      render: (sort: number) => <span className="text-gray-600">{sort}</span>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => (
        <span className="text-gray-600 text-sm">{text || '-'}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      align: 'center' as const,
      render: (_: any, record: SitePublish) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<Edit className="w-3.5 h-3.5" />}
            onClick={() => handleEdit(record)}
            className="text-blue-600 hover:text-blue-700"
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个页面发布配置吗？"
            onConfirm={() => handleDelete(record.id!)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              size="small"
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              页面发布管理
            </h2>
            <p className="text-sm text-gray-500 mt-2 ml-1">
              配置导航页面的发布路由，管理独立的访问地址和显示选项
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAdd}
            className="shadow-sm"
          >
            新增配置
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={sitePublishList}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
            className: 'px-4 py-3',
          }}
          className="site-publish-table"
          scroll={{ y: 'calc(100vh - 320px)' }}
        />
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5 text-blue-600" />
            {editingItem ? '编辑页面发布配置' : '新增页面发布配置'}
          </div>
        }
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          className="mt-4"
        >
          {editingItem?.defPage && (
            <Alert
              message="默认页提示"
              description="当前编辑的是默认页，默认页不允许禁用。如需禁用，请先设置其他页面为默认页。"
              type="info"
              showIcon
              icon={<Star className="w-4 h-4" />}
              className="mb-4"
            />
          )}
          <Alert
            message="路由路径限制"
            description={
              <div>
                <p className="mb-2">路由路径不能使用以下保留路径：</p>
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <code>/ (根路径)</code>、<code>admin</code>、<code>navigation</code>、
                  <code>navCategory</code>、<code>sysConfigs</code>、<code>webs</code>、
                  <code>data</code>、<code>sitePublish</code>、<code>login</code>、
                  <code>init</code>、<code>api</code>、<code>doc</code>、
                  <code>v3</code>、<code>swagger</code>、<code>webjars</code>
                </div>
              </div>
            }
            type="warning"
            showIcon
            className="mb-4"
          />

          <Form.Item
            label="页面名称"
            name="name"
            rules={[{ required: true, message: '请输入页面名称' }]}
          >
            <Input placeholder="如：开发运维主页" />
          </Form.Item>

          <Form.Item
            label="路由路径"
            name="routePath"
            rules={[
              { required: true, message: '请输入路由路径' },
              { pattern: /^[a-zA-Z0-9-_]+$/, message: '只能包含字母、数字、横杠和下划线' }
            ]}
            tooltip="路径会自动加上前缀 /，只需输入路径名称，如：dev、cp、public"
          >
            <Input
              placeholder="dev"
              addonBefore="/"
            />
          </Form.Item>
          <Form.Item
            label="隐藏管理入口"
            name="hideAdminEntry"
            valuePropName="checked"
            tooltip="是否在此页面隐藏管理后台入口"
          >
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>

          <Form.Item
            label="启用状态"
            name="enabled"
            valuePropName="checked"
            tooltip={editingItem?.defPage ? "默认页不允许禁用" : "是否启用该页面发布配置"}
          >
            <Switch
              checkedChildren="启用"
              unCheckedChildren="禁用"
              disabled={editingItem?.defPage && form.getFieldValue('enabled')}
            />
          </Form.Item>

          <Form.Item
            label="排序"
            name="sort"
            rules={[{ required: true, message: '请输入排序值' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="描述说明"
            name="description"
          >
            <Input.TextArea
              placeholder="描述这个页面配置的用途"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SitePublishManagement;
