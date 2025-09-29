import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Switch, message, Popconfirm, Space } from 'antd';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { NavItem, NavCategory } from '@/types';
import { navigationApi, categoryApi } from '@/services/api';

const NavManagement: React.FC = () => {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [navResponse, categoryResponse] = await Promise.all([
        navigationApi.getList(),
        categoryApi.getList(),
      ]);

      // 处理 ResultVO 响应结构
      if (navResponse.code === 200 && navResponse.data) {
        setNavItems(navResponse.data);
      } else {
        console.error('导航接口响应异常:', navResponse);
        setNavItems([]);
      }

      if (categoryResponse.code === 200 && categoryResponse.data) {
        setCategories(categoryResponse.data);
      } else {
        console.error('分类接口响应异常:', categoryResponse);
        setCategories([]);
      }
    } catch (error) {
      console.error('加载导航数据失败:', error);
      setNavItems([]);
      setCategories([]);
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
      sort: 1,
      lookAccount: true,
      nvaAccessSecret: 'tan',
      status: true, // Switch 组件使用 true/false
    });
    setModalVisible(true);
  };

  const handleEdit = (item: NavItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      name: item.name,
      url: item.url,
      category: item.category,
      sort: item.sort,
      icon: item.icon,
      remark: item.remark,
      account: item.account,
      password: item.password,
      lookAccount: item.lookAccount,
      nvaAccessSecret: item.nvaAccessSecret,
      status: item.status === 1, // 转换为 boolean
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      const submitData: Partial<NavItem> = {
        name: values.name,
        url: values.url,
        category: values.category,
        sort: values.sort,
        icon: values.icon || '',
        remark: values.remark || '',
        account: values.account || '',
        password: values.password || '',
        lookAccount: values.lookAccount !== undefined ? values.lookAccount : true,
        nvaAccessSecret: values.nvaAccessSecret || 'tan',
        status: values.status ? 1 : 0, // 转换为数字
      };

      if (editingItem) {
        await navigationApi.update({ ...editingItem, ...submitData } as NavItem);
        message.success('更新成功');
      } else {
        await navigationApi.create(submitData as Omit<NavItem, 'id'>);
        message.success('添加成功');
      }

      setModalVisible(false);
      loadData();
    } catch (error) {
      console.error('导航操作失败:', error);
      // 全局错误已在request.ts中处理，此处不需要再显示
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await navigationApi.delete(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      console.error('删除导航失败:', error);
      // 全局错误已在request.ts中处理，此处不需要再显示
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      width: 150,
      ellipsis: true,
      render: (url: string) => (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
          title={url}
        >
          {url}
        </a>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      ellipsis: true,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 60,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: number) => (
        <span className={status === 1 ? 'text-green-600' : 'text-red-600'}>
          {status === 1 ? '启用' : '停用'}
        </span>
      ),
    },
    {
      title: '账户权限',
      dataIndex: 'lookAccount',
      key: 'lookAccount',
      width: 100,
      render: (lookAccount: boolean) => (
        <span className={lookAccount ? 'text-green-600' : 'text-orange-600'}>
          {lookAccount ? '可查看' : '需密钥'}
        </span>
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <span title={text}>{text}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: NavItem) => (
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
            title="确定删除该导航项吗？"
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

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">导航管理</h2>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleAdd}
        >
          添加导航
        </Button>
      </div>

      <div className="overflow-hidden">
        <Table
          columns={columns}
          dataSource={navItems}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </div>

      <Modal
        title={editingItem ? '编辑导航' : '添加导航'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="请输入导航名称" />
          </Form.Item>

          <Form.Item
            name="url"
            label="URL"
            rules={[
              { required: true, message: '请输入URL' },
              { type: 'url', message: '请输入有效的URL' },
            ]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              {categories.map((category) => (
                <Select.Option key={category.id} value={category.categoryName}>
                  {category.categoryName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="sort"
            label="排序"
            rules={[{ required: true, message: '请输入排序值' }]}
          >
            <InputNumber min={0} placeholder="排序值，数字越小越靠前" className="w-full" />
          </Form.Item>

          <Form.Item
            name="icon"
            label="图标"
            tooltip="支持URL链接或base64编码的图片"
          >
            <Input placeholder="图标URL或base64编码" />
          </Form.Item>

          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="导航描述信息" />
          </Form.Item>

          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-3">账户信息（可选）</h4>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="account" label="登录账号">
                <Input placeholder="登录账号" />
              </Form.Item>
              <Form.Item name="password" label="登录密码">
                <Input.Password placeholder="登录密码" />
              </Form.Item>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Form.Item
                name="lookAccount"
                label="账户信息查看权限"
                valuePropName="checked"
                tooltip="是否允许查看登录信息：开启=直接查看，关闭=需要密钥"
              >
                <Switch
                  checkedChildren="可查看"
                  unCheckedChildren="需密钥"
                />
              </Form.Item>
              <Form.Item
                name="nvaAccessSecret"
                label="查看密钥"
                tooltip="查看账户信息时需要的密钥，默认为 tan"
              >
                <Input placeholder="查看密钥（默认：tan）" />
              </Form.Item>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-3">其他设置</h4>
            <Form.Item
              name="status"
              label="状态"
              valuePropName="checked"
              tooltip="是否启用该导航项"
            >
              <Switch
                checkedChildren="启用"
                unCheckedChildren="停用"
              />
            </Form.Item>
          </div>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingItem ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NavManagement;
