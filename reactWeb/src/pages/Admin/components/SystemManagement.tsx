import React, { useState, useEffect } from 'react';
import { Form, Input, Select, message, Button, Card, Space, Row, Col } from 'antd';
import { Save } from 'lucide-react';
import type { SysConfig } from '@/types';
import { sysConfigApi } from '@/services/api';

const SystemManagement: React.FC = () => {
  const [config, setConfig] = useState<SysConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const configFields = [
    { key: 'siteTitle', label: '网站标题', type: 'text' },
    { key: 'siteLogo', label: '网站Logo', type: 'textarea' },
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
      const response = await sysConfigApi.getConfig();
      const configData = response.data;
      setConfig(configData);
      if (configData) {
        form.setFieldsValue(configData);
      }
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      if (config) {
        await sysConfigApi.update({ ...config, ...values });
        message.success('更新成功');
      }
      loadData();
    } catch (error) {
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: any) => {
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
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">系统配置</h2>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            {configFields.map((field) => (
              <Col span={12} key={field.key}>
                <Form.Item
                  name={field.key}
                  label={field.label}
                  rules={[{ required: true, message: `请输入${field.label}` }]}
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
    </div>
  );
};

export default SystemManagement;