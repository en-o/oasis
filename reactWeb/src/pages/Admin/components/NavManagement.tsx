import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, message, Popconfirm, Space } from 'antd';
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
      setNavItems(navResponse.data || []);
      setCategories(categoryResponse.data || []);
    } catch (error) {
      console.error('加载导航数据失败:', error);
      // 全局错误已在request.ts中处理，此处不需要再显示
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
    setModalVisible(true);
  };

  const handleEdit = (item: NavItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      ...item,
      account: item.accountInfo?.account,
      password: item.accountInfo?.password,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      const submitData: Partial<NavItem> = {
        ...values,
        accountInfo: values.account && values.password ? {
          account: values.account,
          password: values.password,
        } : undefined,
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
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
          {url}
        </a>
      ),
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
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
            name="categoryName"
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
              <Form.Item name="account" label="账号">
                <Input placeholder="账号" />
              </Form.Item>
              <Form.Item name="password" label="密码">
                <Input.Password placeholder="密码" />
              </Form.Item>
            </div>
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