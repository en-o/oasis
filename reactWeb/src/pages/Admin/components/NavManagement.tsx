import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Switch, Popconfirm, Space, Radio, Upload, App, Tag, Row, Col } from 'antd';
import { Plus, Edit, Trash2, UploadCloud, Search } from 'lucide-react';
import type { NavItem, NavCategory } from '@/types';
import { navigationApi, categoryApi } from '@/services/api';

// 定义7种浅色系背景颜色（不包括黑色，以文字为重点）
const pastelColors = [
  { bg: '#DBEAFE', text: '#1D4ED8' },  // 浅蓝色
  { bg: '#D1FAE5', text: '#047857' },  // 浅绿色
  { bg: '#E9D5FF', text: '#7C3AED' },  // 浅紫色
  { bg: '#FCE7F3', text: '#BE185D' },  // 浅粉色
  { bg: '#FED7AA', text: '#C2410C' },  // 浅橙色
  { bg: '#CFFAFE', text: '#0E7490' },  // 浅青色
  { bg: '#E0E7FF', text: '#4338CA' },  // 浅靛蓝色
];

// 根据标题生成固定的颜色索引
const getColorByTitle = (title: string): { bg: string; text: string } => {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % pastelColors.length;
  return pastelColors[index];
};

// 获取标题的前两个字符
const getTitleAbbr = (title: string): string => {
  if (!title) return '';
  const trimmed = title.trim();
  return trimmed.length >= 2 ? trimmed.slice(0, 2).toUpperCase() : trimmed.toUpperCase();
};

const NavManagement: React.FC = () => {
  const { message } = App.useApp();
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  const [iconType, setIconType] = useState<'url' | 'upload' | 'none'>('none');
  const [iconPreview, setIconPreview] = useState<string>('');
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 搜索条件
  const [searchParams, setSearchParams] = useState<{ name?: string; category?: string; status?: number }>({});

  const loadData = async () => {
    setLoading(true);
    try {
      // 加载分类列表
      const categoryResponse = await categoryApi.getList();
      if (categoryResponse.code === 200 && categoryResponse.data) {
        setCategories(categoryResponse.data);
      } else {
        console.error('分类接口响应异常:', categoryResponse);
        setCategories([]);
      }

      // 使用分页接口加载导航数据
      const navResponse = await navigationApi.getPage({
        ...searchParams,
        page: {
          pageIndex: currentPage,
          pageSize,
        },
      });

      if (navResponse.code === 200 && navResponse.data) {
        const pageData = navResponse.data;
        setNavItems(pageData.rows || []);
        setTotal(pageData.total || 0);
      } else {
        console.error('导航接口响应异常:', navResponse);
        setNavItems([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('加载导航数据失败:', error);
      setNavItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, pageSize, searchParams]);

  // 处理搜索
  const handleSearch = (values: any) => {
    setSearchParams({
      name: values.name || undefined,
      category: values.category || undefined,
      status: values.status !== undefined ? values.status : undefined,
    });
    setCurrentPage(1); // 搜索时重置到第一页
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    setSearchParams({});
    setCurrentPage(1);
  };

  // 处理分页变化
  const handleTableChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIconType('none');
    setIconPreview('');
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

    // 判断图标类型
    let type: 'url' | 'upload' | 'none' = 'none';
    if (item.icon) {
      if (item.icon.startsWith('data:image')) {
        type = 'upload';
      } else if (item.icon.startsWith('http://') || item.icon.startsWith('https://')) {
        type = 'url';
      }
      setIconPreview(item.icon);
    }
    setIconType(type);

    // 处理分类：将逗号分隔的字符串转换为数组
    const categoryArray = item.category ? item.category.split(',').map(c => c.trim()).filter(c => c) : [];

    form.setFieldsValue({
      name: item.name,
      url: item.url,
      category: categoryArray,
      sort: item.sort,
      icon: item.icon,
      iconUrl: type === 'url' ? item.icon : '',
      remark: item.remark,
      account: item.account,
      password: item.password,
      lookAccount: item.lookAccount,
      nvaAccessSecret: item.nvaAccessSecret,
      status: item.status === 1, // 转换为 boolean
      showPlatform: item.showPlatform,
    });
    setModalVisible(true);
  };

  // 将文件转换为 base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // 处理图片上传
  const handleImageUpload = async (file: File) => {
    // 验证文件类型
    const isValidImage = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'].includes(file.type);
    if (!isValidImage) {
      message.error('只支持 JPG/PNG 格式的图片！不支持 SVG');
      return false;
    }

    // 验证文件大小（限制 2MB）
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB！');
      return false;
    }

    try {
      const base64 = await fileToBase64(file);
      setIconPreview(base64);
      form.setFieldValue('icon', base64);
    } catch (error) {
      message.error('图片转换失败');
    }

    return false; // 阻止自动上传
  };

  // 处理图标类型切换
  const handleIconTypeChange = (type: 'url' | 'upload' | 'none') => {
    setIconType(type);
    setIconPreview('');
    form.setFieldValue('icon', '');
    form.setFieldValue('iconUrl', '');
  };

  const handleSubmit = async (values: any) => {
    try {
      // 根据图标类型确定最终的图标值
      let finalIcon = '';
      if (iconType === 'url') {
        finalIcon = values.iconUrl || '';
        // 验证 URL 必须是 http 或 https
        if (finalIcon && !finalIcon.startsWith('http://') && !finalIcon.startsWith('https://')) {
          message.error('图标 URL 必须是 HTTP 或 HTTPS 地址');
          return;
        }
      } else if (iconType === 'upload') {
        finalIcon = iconPreview || '';
      }
      // iconType === 'none' 时 finalIcon 为空字符串

      // 处理分类：将数组转换为逗号分隔的字符串
      const categoryValue = Array.isArray(values.category)
        ? values.category.join(',')
        : values.category;

      const submitData: Partial<NavItem> = {
        name: values.name,
        url: values.url,
        category: categoryValue,
        sort: values.sort,
        icon: finalIcon,
        remark: values.remark || '',
        account: values.account || '',
        password: values.password || '',
        lookAccount: values.lookAccount !== undefined ? values.lookAccount : true,
        nvaAccessSecret: values.nvaAccessSecret || 'tan',
        status: values.status ? 1 : 0, // 转换为数字
        showPlatform: values.showPlatform !== undefined && values.showPlatform !== null ? values.showPlatform : undefined,
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
      const errorMessage = error instanceof Error ? error.message : '操作失败';
      message.error(errorMessage);
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
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 65,
      align: 'center' as const,
      render: (icon: string, record: NavItem) => {
        const color = getColorByTitle(record.name);
        const abbr = getTitleAbbr(record.name);

        if (!icon) {
          return (
            <div
              className="mx-auto flex items-center justify-center rounded font-bold text-sm"
              style={{ width: '32px', height: '32px', backgroundColor: color.bg, color: color.text }}
            >
              {abbr}
            </div>
          );
        }
        return (
          <img
            src={icon}
            alt={record.name}
            className="mx-auto object-contain rounded"
            style={{ width: '32px', height: '32px' }}
            onError={(e) => {
              // 图片加载失败时显示文字
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent && !parent.querySelector('.fallback-icon')) {
                const fallback = document.createElement('div');
                fallback.className = 'fallback-icon mx-auto flex items-center justify-center rounded font-bold text-sm';
                fallback.style.width = '32px';
                fallback.style.height = '32px';
                fallback.style.backgroundColor = color.bg;
                fallback.style.color = color.text;
                fallback.textContent = abbr;
                parent.appendChild(fallback);
              }
            }}
          />
        );
      },
    },
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
      width: 150,
      render: (category: string) => {
        const categories = category ? category.split(',').map(c => c.trim()).filter(c => c) : [];
        return (
          <Space size={[0, 4]} wrap>
            {categories.map((cat, index) => (
              <Tag key={index} color="blue">
                {cat}
              </Tag>
            ))}
          </Space>
        );
      },
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

      {/* 搜索表单 */}
      <Form
        form={searchForm}
        onFinish={handleSearch}
        className="mb-6 bg-gray-50 p-4 rounded-lg"
      >
        <Row gutter={16} align="bottom">
          <Col span={6}>
            <Form.Item name="category" label="分类" className="mb-0">
              <Select
                placeholder="请选择分类"
                allowClear
                onChange={() => {
                  searchForm.submit();
                }}
              >
                {categories.map((category) => (
                  <Select.Option key={category.id} value={category.categoryName}>
                    {category.categoryName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="name" label="标题" className="mb-0">
              <Input placeholder="请输入导航标题" allowClear />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="status" label="状态" className="mb-0">
              <Select
                placeholder="请选择状态"
                allowClear
                onChange={() => {
                  searchForm.submit();
                }}
              >
                <Select.Option value={1}>启用</Select.Option>
                <Select.Option value={0}>停用</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item className="mb-0">
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<Search className="w-4 h-4" />}
                >
                  搜索
                </Button>
                <Button onClick={handleReset}>重置</Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <div className="overflow-hidden">
        <Table
          columns={columns}
          dataSource={navItems}
          loading={loading}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: handleTableChange,
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
              {
                pattern: /^https?:\/\/.+/,
                message: '请输入有效的 HTTP 或 HTTPS 地址'
              }
            ]}
          >
            <Input placeholder="http://example.com 或 https://example.com" />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类（可多选）"
            rules={[{ required: true, message: '请选择至少一个分类' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择一个或多个分类"
              showSearch
              optionFilterProp="children"
            >
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

          <Form.Item label="图标">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio.Group
                value={iconType}
                onChange={(e) => handleIconTypeChange(e.target.value)}
              >
                <Radio value="none">无图标</Radio>
                <Radio value="url">使用 URL 地址</Radio>
                <Radio value="upload">上传图片</Radio>
              </Radio.Group>

              {iconType === 'url' && (
                <Form.Item
                  name="iconUrl"
                  noStyle
                  rules={[
                    {
                      pattern: /^https?:\/\/.+/,
                      message: '请输入有效的 HTTP 或 HTTPS 地址'
                    }
                  ]}
                >
                  <Input
                    placeholder="http://example.com/icon.png 或 https://example.com/icon.png"
                    onChange={(e) => setIconPreview(e.target.value)}
                  />
                </Form.Item>
              )}

              {iconType === 'upload' && (
                <Upload
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  showUploadList={false}
                  beforeUpload={handleImageUpload}
                  maxCount={1}
                >
                  <Button icon={<UploadCloud className="w-4 h-4" />}>
                    选择图片 (JPG/PNG/GIF/WEBP，不支持SVG)
                  </Button>
                </Upload>
              )}

              {iconPreview && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
                  <img
                    src={iconPreview}
                    alt="预览"
                    className="w-12 h-12 object-contain rounded"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMTYgMTZMMzIgMzJNMzIgMTZMMTYgMzIiIHN0cm9rZT0iIzlDQTNCQSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+';
                    }}
                  />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">图标预览</div>
                    <div className="text-xs text-gray-400 mt-1 break-all">
                      {iconType === 'url' ? '外部链接' : `Base64 (${Math.round(iconPreview.length / 1024)}KB)`}
                    </div>
                  </div>
                  <Button
                    size="small"
                    danger
                    onClick={() => {
                      setIconPreview('');
                      form.setFieldValue('icon', '');
                      form.setFieldValue('iconUrl', '');
                    }}
                  >
                    清除
                  </Button>
                </div>
              )}

              <div className="text-xs text-gray-500">
                • 支持上传常规图片格式（不支持 SVG）<br />
                • 支持使用 HTTP/HTTPS 图片地址<br />
                • 图标可为空，将显示默认样式
              </div>
            </Space>
          </Form.Item>

          <Form.Item name="icon" hidden>
            <Input />
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
              name="showPlatform"
              label="平台列表"
              tooltip="可显示的平台列表，输入逗号分隔的routePath，如：dev,cp,public。（默认dev）"
            >
              <Input
                placeholder="如：dev,cp,public（默认dev）"
                allowClear
              />
            </Form.Item>
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
