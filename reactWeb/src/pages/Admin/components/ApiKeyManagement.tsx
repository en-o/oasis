import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Popconfirm, Space, App, Tag, Typography, Checkbox, Tooltip, Tabs, Spin } from 'antd';
import { Plus, Trash2, Key, Copy, Ban, CheckCircle, Play, Code } from 'lucide-react';
import type { ApiKey, ApiKeyAddRequest, OpenApiEndpoint, ApiParam } from '@/types';
import { apiKeyApi } from '@/services/api';

const { Text } = Typography;

const ApiKeyManagement: React.FC = () => {
  const { message } = App.useApp();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [endpoints, setEndpoints] = useState<OpenApiEndpoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newKeyModalVisible, setNewKeyModalVisible] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string>('');
  const [form] = Form.useForm();

  // 测试相关状态
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [testingKey, setTestingKey] = useState<ApiKey | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<OpenApiEndpoint | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ status: number; data: any } | null>(null);
  const [requestBody, setRequestBody] = useState<string>('');
  const [testApiKey, setTestApiKey] = useState<string>(''); // 用户输入的完整 API Key

  // 加载API Key列表
  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiKeyApi.getList();
      if (response.code === 200 && response.data) {
        setApiKeys(response.data);
      } else {
        console.error('API Key接口响应异常:', response);
        setApiKeys([]);
      }
    } catch (error) {
      console.error('加载API Key数据失败:', error);
      setApiKeys([]);
    } finally {
      setLoading(false);
    }
  };

  // 加载可授权的接口清单
  const loadEndpoints = async () => {
    try {
      const response = await apiKeyApi.getEndpoints();
      if (response.code === 200 && response.data) {
        setEndpoints(response.data);
      }
    } catch (error) {
      console.error('加载接口清单失败:', error);
    }
  };

  useEffect(() => {
    loadData();
    loadEndpoints();
  }, []);

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({ expireDays: 30 });
    setModalVisible(true);
  };

  const handleSubmit = async (values: ApiKeyAddRequest) => {
    try {
      // 将权限数组转换为逗号分隔的字符串
      const permissions = values.permissions;
      const submitData = {
        ...values,
        permissions: Array.isArray(permissions) ? permissions.join(',') : permissions,
      };

      const response = await apiKeyApi.create(submitData);
      if (response.code === 200 && response.data) {
        setNewApiKey(response.data.apiKey);
        setNewKeyModalVisible(true);
        message.success('创建成功');
        setModalVisible(false);
        loadData();
      }
    } catch (error) {
      console.error('创建API Key失败:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiKeyApi.delete(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      console.error('删除API Key失败:', error);
    }
  };

  const handleRevoke = async (id: number) => {
    try {
      await apiKeyApi.revoke(id);
      message.success('已禁用');
      loadData();
    } catch (error) {
      console.error('禁用API Key失败:', error);
    }
  };

  const handleEnable = async (id: number) => {
    try {
      await apiKeyApi.enable(id);
      message.success('已启用');
      loadData();
    } catch (error) {
      console.error('启用API Key失败:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('已复制到剪贴板');
    }).catch(() => {
      message.error('复制失败');
    });
  };

  // 打开测试弹窗
  const handleOpenTest = (record: ApiKey) => {
    setTestingKey(record);
    setSelectedEndpoint(null);
    setTestResult(null);
    setRequestBody('');
    setTestApiKey(record.apiKey); // 自动填充完整的 API Key
    setTestModalVisible(true);
  };

  // 获取该 API Key 有权限的接口列表
  const getKeyEndpoints = (): OpenApiEndpoint[] => {
    if (!testingKey?.permissions) return [];
    const permList = testingKey.permissions.split(',').map(p => p.trim());
    return endpoints.filter(e => permList.includes(e.permission));
  };

  // 获取默认请求体 - 优先使用后端返回的示例
  const getDefaultRequestBody = (endpoint: OpenApiEndpoint): string => {
    if (endpoint.method === 'GET') return '';
    // 优先使用后端返回的请求示例
    if (endpoint.requestExample) {
      return endpoint.requestExample;
    }
    return '{}';
  };

  // 选择接口
  const handleSelectEndpoint = (endpoint: OpenApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    setTestResult(null);
    setRequestBody(getDefaultRequestBody(endpoint));
  };

  // 执行测试请求
  const handleTestRequest = async () => {
    if (!selectedEndpoint || !testingKey) return;

    if (!testApiKey.trim()) {
      message.warning('请输入完整的 API Key');
      return;
    }

    setTestLoading(true);
    try {
      // 获取 API 基础路径
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL !== undefined
        ? import.meta.env.VITE_API_BASE_URL
        : '/api';
      const baseUrl = window.location.origin;
      const url = `${baseUrl}${apiBaseUrl}${selectedEndpoint.path}`;

      const headers: HeadersInit = {
        'X-Api-Key': testApiKey.trim(),
        'Content-Type': 'application/json',
      };

      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers,
      };

      if (selectedEndpoint.method === 'POST' && requestBody) {
        options.body = requestBody;
      }

      const response = await fetch(url, options);
      const contentType = response.headers.get('content-type') || '';

      let data: any;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // 非 JSON 响应，获取文本内容
        const text = await response.text();
        data = {
          error: '响应不是 JSON 格式',
          contentType,
          body: text.substring(0, 500) + (text.length > 500 ? '...' : '')
        };
      }

      setTestResult({
        status: response.status,
        data,
      });
    } catch (error: any) {
      setTestResult({
        status: 0,
        data: { error: error.message || '请求失败' },
      });
    } finally {
      setTestLoading(false);
    }
  };

  // 生成 cURL 命令
  const generateCurlCommand = (): string => {
    if (!selectedEndpoint || !testingKey) return '';
    const apiKey = testApiKey.trim() || '<your-api-key>';
    const url = `http://your-domain${selectedEndpoint.path}`;

    let curl = `curl -X ${selectedEndpoint.method} "${url}"`;
    curl += ` \\\n  -H "X-Api-Key: ${apiKey}"`;
    curl += ` \\\n  -H "Content-Type: application/json"`;

    if (selectedEndpoint.method === 'POST' && requestBody) {
      // 压缩 JSON 用于 cURL
      try {
        const compressed = JSON.stringify(JSON.parse(requestBody));
        curl += ` \\\n  -d '${compressed}'`;
      } catch {
        curl += ` \\\n  -d '${requestBody}'`;
      }
    }

    return curl;
  };

  // 扁平化嵌套参数，用于表格展示
  const flattenParams = (params: ApiParam[], level = 0): (ApiParam & { level: number })[] => {
    const result: (ApiParam & { level: number })[] = [];
    for (const param of params) {
      result.push({ ...param, level });
      if (param.children && param.children.length > 0) {
        result.push(...flattenParams(param.children, level + 1));
      }
    }
    return result;
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusTag = (record: ApiKey) => {
    if (record.expired) {
      return <Tag color="default">已过期</Tag>;
    }
    if (record.status === 0) {
      return <Tag color="red">已禁用</Tag>;
    }
    return <Tag color="green">正常</Tag>;
  };

  // 根据权限标识获取接口名称
  const getEndpointName = (permission: string): string => {
    const endpoint = endpoints.find(e => e.permission === permission);
    return endpoint ? endpoint.name : permission;
  };

  const getPermissionTags = (permissions?: string) => {
    if (!permissions) return <Tag>全部权限</Tag>;
    const permList = permissions.split(',').map(p => p.trim());
    return (
      <div className="flex flex-wrap gap-1">
        {permList.slice(0, 3).map(p => (
          <Tooltip key={p} title={getEndpointName(p)}>
            <Tag color="blue">{p}</Tag>
          </Tooltip>
        ))}
        {permList.length > 3 && (
          <Tooltip title={permList.slice(3).map(p => getEndpointName(p)).join(', ')}>
            <Tag>+{permList.length - 3}</Tag>
          </Tooltip>
        )}
      </div>
    );
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      ellipsis: true,
      render: (text: string, record: ApiKey) => (
        record.remark ? (
          <Tooltip title={record.remark}>
            <span className="cursor-help">{text}</span>
          </Tooltip>
        ) : text
      ),
    },
    {
      title: 'API Key',
      dataIndex: 'apiKey',
      key: 'apiKey',
      width: 200,
      render: (text: string) => {
        // 显示遮掩版本，复制完整原文
        const masked = text.length > 20
          ? `${text.substring(0, 10)}****${text.substring(text.length - 6)}`
          : text;
        return <Text code copyable={{ text }}>{masked}</Text>;
      },
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      width: 160,
      ellipsis: true,
      render: (text: string) => getPermissionTags(text),
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: (_: any, record: ApiKey) => getStatusTag(record),
    },
    {
      title: '过期时间',
      dataIndex: 'expireTime',
      key: 'expireTime',
      width: 140,
      render: (text: string) => formatDateTime(text),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: ApiKey) => (
        <Space split={<span className="text-gray-300">|</span>}>
          {record.status === 1 && !record.expired && (
            <Tooltip title="测试接口">
              <Button
                type="link"
                size="small"
                icon={<Play className="w-4 h-4" />}
                onClick={() => handleOpenTest(record)}
              />
            </Tooltip>
          )}
          {record.status === 1 && !record.expired ? (
            <Popconfirm
              title="确定禁用该API Key吗？"
              onConfirm={() => handleRevoke(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Tooltip title="禁用">
                <Button
                  type="link"
                  size="small"
                  icon={<Ban className="w-4 h-4" />}
                />
              </Tooltip>
            </Popconfirm>
          ) : (
            !record.expired && (
              <Tooltip title="启用">
                <Button
                  type="link"
                  size="small"
                  icon={<CheckCircle className="w-4 h-4" />}
                  onClick={() => handleEnable(record.id)}
                />
              </Tooltip>
            )
          )}
          <Popconfirm
            title="确定删除该API Key吗？"
            description="删除后无法恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="link"
                size="small"
                danger
                icon={<Trash2 className="w-4 h-4" />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">第三方开发</h2>
          <p className="text-gray-500 text-sm mt-1">
            管理API Key，允许第三方应用通过 X-Api-Key 请求头访问 /openapi/* 接口
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleAdd}
        >
          创建API Key
        </Button>
      </div>

      <div className="overflow-hidden">
        <Table
          columns={columns}
          dataSource={apiKeys}
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

      {/* 创建API Key弹窗 */}
      <Modal
        title="创建API Key"
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
            <Input placeholder="请输入名称，用于标识该Key的用途" />
          </Form.Item>

          <Form.Item
            name="expireDays"
            label="有效期（天）"
            rules={[{ required: true, message: '请选择有效期' }]}
          >
            <Select placeholder="请选择有效期">
              <Select.Option value={7}>7天</Select.Option>
              <Select.Option value={30}>30天</Select.Option>
              <Select.Option value={90}>90天</Select.Option>
              <Select.Option value={180}>180天</Select.Option>
              <Select.Option value={365}>365天</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="permissions"
            label="接口权限"
            rules={[{ required: true, message: '请至少选择一个接口权限' }]}
          >
            <Checkbox.Group className="w-full">
              <div className="grid grid-cols-1 gap-2">
                {endpoints.map(endpoint => (
                  <Checkbox key={endpoint.permission} value={endpoint.permission}>
                    <span className="font-medium">{endpoint.name}</span>
                    <span className="text-gray-400 text-xs ml-2">
                      {endpoint.method} {endpoint.path}
                    </span>
                  </Checkbox>
                ))}
              </div>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item
            name="remark"
            label="备注"
          >
            <Input.TextArea rows={2} placeholder="可选，备注信息" />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                创建
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 显示新创建的API Key */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-green-500" />
            <span>API Key 创建成功</span>
          </div>
        }
        open={newKeyModalVisible}
        onCancel={() => setNewKeyModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setNewKeyModalVisible(false)}>
            关闭
          </Button>,
          <Button
            key="copy"
            type="primary"
            icon={<Copy className="w-4 h-4" />}
            onClick={() => copyToClipboard(newApiKey)}
          >
            复制
          </Button>,
        ]}
        width={600}
      >
        <div className="mt-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              请立即复制并妥善保存此API Key，关闭此窗口后将无法再次查看完整Key。
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <Text code className="text-base break-all">{newApiKey}</Text>
          </div>
          <div className="mt-4 text-gray-500 text-sm">
            <p className="mb-2">使用方法：</p>
            <pre className="bg-gray-100 rounded p-3 text-xs overflow-x-auto">
{`curl -H "X-Api-Key: ${newApiKey}" \\
     http://your-domain/openapi/nav/list`}
            </pre>
          </div>
        </div>
      </Modal>

      {/* 接口测试弹窗 */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-500" />
            <span>接口测试 - {testingKey?.name}</span>
          </div>
        }
        open={testModalVisible}
        onCancel={() => setTestModalVisible(false)}
        footer={null}
        width={900}
        styles={{ body: { maxHeight: '70vh', overflow: 'auto' } }}
      >
        <div className="mt-4">
          {/* API Key */}
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">API Key：</div>
            <Input.Password
              value={testApiKey}
              onChange={e => setTestApiKey(e.target.value)}
              placeholder="请输入 API Key"
            />
          </div>

          {/* 接口选择 */}
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">选择要测试的接口：</div>
            <div className="flex flex-wrap gap-2">
              {getKeyEndpoints().map(endpoint => (
                <Button
                  key={endpoint.permission}
                  type={selectedEndpoint?.permission === endpoint.permission ? 'primary' : 'default'}
                  size="small"
                  onClick={() => handleSelectEndpoint(endpoint)}
                >
                  <Tag color={endpoint.method === 'GET' ? 'green' : 'blue'} className="mr-1">
                    {endpoint.method}
                  </Tag>
                  {endpoint.name}
                </Button>
              ))}
            </div>
          </div>

          {selectedEndpoint && (
            <>
              {/* 接口信息 */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-4 mb-2">
                  <Tag color={selectedEndpoint.method === 'GET' ? 'green' : 'blue'}>
                    {selectedEndpoint.method}
                  </Tag>
                  <Text code>{selectedEndpoint.path}</Text>
                </div>
                <div className="text-gray-500 text-sm">{selectedEndpoint.name}</div>
                {selectedEndpoint.description && (
                  <div className="text-gray-400 text-xs mt-1">{selectedEndpoint.description}</div>
                )}
              </div>

              {/* POST 请求体编辑 */}
              {selectedEndpoint.method === 'POST' && (
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">请求体 (JSON)：</div>
                  <Input.TextArea
                    value={requestBody}
                    onChange={e => setRequestBody(e.target.value)}
                    rows={6}
                    className="font-mono text-sm"
                    placeholder="输入 JSON 请求体"
                  />
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-2 mb-4">
                <Button
                  type="primary"
                  icon={<Play className="w-4 h-4" />}
                  onClick={handleTestRequest}
                  loading={testLoading}
                >
                  发送请求
                </Button>
                <Button
                  icon={<Copy className="w-4 h-4" />}
                  onClick={() => copyToClipboard(generateCurlCommand())}
                >
                  复制 cURL
                </Button>
              </div>

              {/* Tabs: 请求参数 & cURL 示例 & 响应示例 & 响应结果 */}
              <Tabs
                items={[
                  {
                    key: 'params',
                    label: '请求参数',
                    children: (
                      <div>
                        {selectedEndpoint.requestParams && selectedEndpoint.requestParams.length > 0 ? (
                          <Table
                            dataSource={flattenParams(selectedEndpoint.requestParams)}
                            columns={[
                              {
                                title: '参数名',
                                dataIndex: 'name',
                                key: 'name',
                                width: 150,
                                render: (text: string, record: ApiParam & { level?: number }) => (
                                  <span style={{ paddingLeft: (record.level || 0) * 16 }}>
                                    {record.level ? '└ ' : ''}{text}
                                  </span>
                                ),
                              },
                              {
                                title: '类型',
                                dataIndex: 'type',
                                key: 'type',
                                width: 100,
                                render: (text: string) => <Tag color="blue">{text}</Tag>,
                              },
                              {
                                title: '必填',
                                dataIndex: 'required',
                                key: 'required',
                                width: 80,
                                render: (val: boolean) => (
                                  <Tag color={val ? 'red' : 'default'}>{val ? '是' : '否'}</Tag>
                                ),
                              },
                              {
                                title: '说明',
                                dataIndex: 'description',
                                key: 'description',
                              },
                              {
                                title: '默认值',
                                dataIndex: 'defaultValue',
                                key: 'defaultValue',
                                width: 100,
                                render: (text: string) => text || '-',
                              },
                            ]}
                            rowKey={(record, index) => `${record.name}-${index}`}
                            pagination={false}
                            size="small"
                          />
                        ) : (
                          <div className="text-gray-400 text-center py-8">
                            {selectedEndpoint.method === 'GET' ? '该接口无请求参数' : '暂无参数定义'}
                          </div>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: 'curl',
                    label: 'cURL 示例',
                    children: (
                      <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-x-auto">
                        {generateCurlCommand()}
                      </pre>
                    ),
                  },
                  {
                    key: 'responseExample',
                    label: '响应示例',
                    children: (
                      <div>
                        {selectedEndpoint.responseExample ? (
                          <pre className="bg-gray-100 rounded-lg p-4 text-sm overflow-x-auto max-h-80">
                            {selectedEndpoint.responseExample}
                          </pre>
                        ) : (
                          <div className="text-gray-400 text-center py-8">
                            暂无响应示例
                          </div>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: 'response',
                    label: '实际响应',
                    children: (
                      <div>
                        {testLoading ? (
                          <div className="flex justify-center py-8">
                            <Spin tip="请求中..." />
                          </div>
                        ) : testResult ? (
                          <div>
                            <div className="mb-2">
                              <Tag color={testResult.status === 200 ? 'success' : 'error'}>
                                HTTP {testResult.status}
                              </Tag>
                            </div>
                            <pre className="bg-gray-100 rounded-lg p-4 text-sm overflow-x-auto max-h-80">
                              {JSON.stringify(testResult.data, null, 2)}
                            </pre>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-center py-8">
                            点击"发送请求"按钮测试接口
                          </div>
                        )}
                      </div>
                    ),
                  },
                ]}
              />
            </>
          )}

          {!selectedEndpoint && (
            <div className="text-gray-400 text-center py-8">
              请先选择要测试的接口
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ApiKeyManagement;
