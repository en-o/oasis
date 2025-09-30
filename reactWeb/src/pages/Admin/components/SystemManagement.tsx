import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, Row, Col, Alert, App } from 'antd';
import { Save, RefreshCw } from 'lucide-react';
import type { SysConfig } from '@/types';
import { sysConfigApi } from '@/services/api';

const SystemManagement: React.FC = () => {
  const { message } = App.useApp();
  const [config, setConfig] = useState<SysConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const configFields = [
    { key: 'siteTitle', label: '网站标题', type: 'text', required: true },
    { key: 'siteLogo', label: '网站Logo', type: 'textarea', required: false, description: '支持Base64编码图片、HTTP/HTTPS链接或留空使用默认图标' },
    { key: 'defaultOpenMode', label: '默认打开方式', type: 'select', required: true, options: [
      { label: '新标签页', value: 1 },
      { label: '当前标签页', value: 0 },
    ]},
    { key: 'hideAdminEntry', label: '隐藏管理入口', type: 'select', required: true, options: [
      { label: '显示', value: 0 },
      { label: '隐藏', value: 1 },
    ]},
    { key: 'username', label: '管理员账号', type: 'text', required: true },
    { key: 'password', label: '管理员密码', type: 'password', required: true },
  ];

  // Logo格式检测函数
  const detectLogoFormat = (value: string) => {
    if (!value || value.trim() === '') {
      return 'empty';
    }

    // Base64格式检测
    if (value.startsWith('data:image/')) {
      return 'base64';
    }

    // URL格式检测
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return 'url';
    }

    return 'invalid';
  };

  // 获取格式描述
  const getFormatDescription = (format: string) => {
    switch (format) {
      case 'base64':
        return 'Base64 编码图片';
      case 'url':
        return 'HTTP/HTTPS 链接';
      case 'empty':
        return '空值 (将显示默认图标)';
      case 'invalid':
        return '无效格式';
      default:
        return '未知';
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await sysConfigApi.getConfig();
      const configData = response.data;
      console.log('管理页面加载的系统配置数据:', configData);
      setConfig(configData);
      if (configData) {
        // 确保表单回显正确的值
        const formValues = {
          siteTitle: configData.siteTitle,
          siteLogo: configData.siteLogo,
          defaultOpenMode: configData.defaultOpenMode,
          hideAdminEntry: configData.hideAdminEntry,
          username: configData.username,
          password: configData.password,
        };
        console.log('设置表单值:', formValues);
        form.setFieldsValue(formValues);
      }
    } catch (error) {
      console.error('加载系统配置失败:', error);
      // 全局错误已在request.ts中处理，此处不需要再显示
    } finally {
      setLoading(false);
    }
  };

  // 移除自动加载，改为手动触发

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      if (config) {
        await sysConfigApi.update({ ...config, ...values });
        message.success('更新成功');
      }
      loadData();
    } catch (error) {
      console.error('更新系统配置失败:', error);
      // 全局错误已在request.ts中处理，此处不需要再显示
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: any) => {
    if (field.key === 'siteLogo') {
      return (
        <div>
          <Input.TextArea
            rows={3}
            placeholder={`请输入${field.label}`}
            onChange={(e) => {
              const format = detectLogoFormat(e.target.value);
              // 可以在这里添加实时验证逻辑
            }}
          />
          <Form.Item noStyle shouldUpdate={(prevValues, curValues) => prevValues.siteLogo !== curValues.siteLogo}>
            {({ getFieldValue }) => {
              const logoValue = getFieldValue('siteLogo');
              const format = detectLogoFormat(logoValue || '');
              const description = getFormatDescription(format);
              const isValid = format !== 'invalid';

              return logoValue ? (
                <Alert
                  message={`检测到格式: ${description}`}
                  type={isValid ? 'success' : 'error'}
                  size="small"
                  style={{ marginTop: 8 }}
                />
              ) : null;
            }}
          </Form.Item>
        </div>
      );
    }

    switch (field.type) {
      case 'select':
        return (
          <Select placeholder={`请选择${field.label}`}>
            {field.options?.map((option: any) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        );
      case 'password':
        return <Input.Password placeholder={`请输入${field.label}`} />;
      case 'textarea':
        return <Input.TextArea rows={3} placeholder={`请输入${field.label}`} />;
      default:
        return <Input placeholder={`请输入${field.label}`} />;
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">系统配置</h2>
        <Button
          type="default"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={loadData}
          loading={loading}
        >
          加载配置
        </Button>
      </div>

      <div className="overflow-auto max-h-[calc(100vh-200px)]">
        {!config ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">请先点击"加载配置"按钮获取系统配置信息</p>
              <Button
                type="primary"
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={loadData}
                loading={loading}
              >
                加载配置
              </Button>
            </div>
          </Card>
        ) : (
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Row gutter={16}>
                {configFields.map((field) => (
                  <Col xs={24} md={12} key={field.key}>
                    <Form.Item
                      name={field.key}
                      label={field.label}
                      rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : []}
                      help={field.description}
                    >
                      {renderField(field)}
                    </Form.Item>
                  </Col>
                ))}
              </Row>

              <Form.Item className="mb-0 text-right">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<Save className="w-4 h-4" />}
                >
                  保存配置
                </Button>
              </Form.Item>
            </Form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SystemManagement;