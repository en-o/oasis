import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm, Space } from 'antd';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { NavCategory } from '@/types';
import { categoryApi } from '@/services/api';

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<NavCategory | null>(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await categoryApi.getList();
      // 处理 ResultVO 响应结构
      if (response.code === 200 && response.data) {
        setCategories(response.data);
      } else {
        console.error('分类接口响应异常:', response);
        setCategories([]);
      }
    } catch (error) {
      console.error('加载分类数据失败:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (category: NavCategory) => {
    setEditingCategory(category);
    form.setFieldsValue(category);
    setModalVisible(true);
  };

  const handleSubmit = async (values: Omit<NavCategory, 'id'>) => {
    try {
      if (editingCategory) {
        // 注意：根据API，分类编辑可能需要特殊处理
        message.info('分类编辑功能待完善');
      } else {
        await categoryApi.create(values);
        message.success('添加成功');
      }

      setModalVisible(false);
      loadData();
    } catch (error) {
      console.error('分类操作失败:', error);
      // 全局错误已在request.ts中处理，此处不需要再显示
    }
  };

  const handleDelete = async (categoryName: string) => {
    try {
      await categoryApi.delete(categoryName);
      message.success('删除成功');
      loadData();
    } catch (error: any) {
      console.error('删除分类失败:', error);
      // 全局错误已在request.ts中处理，此处不需要再显示
    }
  };

  const columns = [
    {
      title: '分类名称',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 60,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: NavCategory) => (
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
            title="确定删除该分类吗？"
            description="删除分类前请确保该分类下没有导航项"
            onConfirm={() => handleDelete(record.categoryName)}
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
        <h2 className="text-xl font-semibold">分类管理</h2>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleAdd}
        >
          添加分类
        </Button>
      </div>

      <div className="overflow-hidden">
        <Table
          columns={columns}
          dataSource={categories}
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
        title={editingCategory ? '编辑分类' : '添加分类'}
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
            name="categoryName"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>

          <Form.Item
            name="sort"
            label="排序"
            rules={[{ required: true, message: '请输入排序值' }]}
          >
            <InputNumber min={0} placeholder="排序值，数字越小越靠前" className="w-full" />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingCategory ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;