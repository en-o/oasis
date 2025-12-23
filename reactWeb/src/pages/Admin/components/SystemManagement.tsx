import React, { useState } from 'react';
import { Form, Input, Select, Button, Card, Row, Col, App, Radio, Upload, Space, Divider } from 'antd';
import { Save, RefreshCw, UploadCloud, Download } from 'lucide-react';
import type { SysConfig } from '@/types';
import { sysConfigApi } from '@/services/api';

const SystemManagement: React.FC = () => {
  const { message } = App.useApp();
  const [config, setConfig] = useState<SysConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [logoType, setLogoType] = useState<'url' | 'upload' | 'none'>('none');
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [form] = Form.useForm();

  const configFields: Array<{
    key: string;
    label: string;
    type: string;
    required: boolean;
    options?: Array<{ label: string; value: number }>;
    description?: string;
  }> = [
    { key: 'siteTitle', label: '网站标题', type: 'text', required: true },
    { key: 'siteLogo', label: '网站Logo', type: 'logo', required: false },
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
    const isValidImage = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg', "image/svg+xml"].includes(file.type);
    if (!isValidImage) {
      message.error('只支持 JPG/PNG/SVG 格式的图片！ ');
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
      setLogoPreview(base64);
      form.setFieldValue('siteLogo', base64);
    } catch (error) {
      message.error('图片转换失败');
    }

    return false; // 阻止自动上传
  };

  // 处理 Logo 类型切换
  const handleLogoTypeChange = (type: 'url' | 'upload' | 'none') => {
    setLogoType(type);
    setLogoPreview('');
    form.setFieldValue('siteLogo', '');
    form.setFieldValue('logoUrl', '');
  };

  // Logo格式检测函数
  const detectLogoFormat = (value: string) => {
    if (!value || value.trim() === '') {
      return 'none';
    }

    // Base64格式检测
    if (value.startsWith('data:image/')) {
      return 'upload';
    }

    // URL格式检测
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return 'url';
    }

    return 'none';
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await sysConfigApi.getConfig();
      const configData = response.data;
      console.log('管理页面加载的系统配置数据:', configData);
      setConfig(configData);
      if (configData) {
        // 检测 Logo 类型并设置预览
        const siteLogo = configData.siteLogo || '';
        const detectedType = detectLogoFormat(siteLogo);
        setLogoType(detectedType);
        if (siteLogo) {
          setLogoPreview(siteLogo);
        }

        // 确保表单回显正确的值
        const formValues = {
          siteTitle: configData.siteTitle,
          siteLogo: configData.siteLogo,
          logoUrl: detectedType === 'url' ? configData.siteLogo : '',
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

  // 处理插件下载
  const handleDownloadExtension = (browser: 'chrome' | 'firefox') => {
    const fileName = browser === 'chrome' ? 'oasisassist-chrome.zip' : 'oasisassist-firefox.zip';
    const downloadUrl = `/extensions/${fileName}`;

    // 创建隐藏的下载链接
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success(`开始下载 ${browser === 'chrome' ? 'Chrome/Edge' : 'Firefox'} 版本插件`);
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // 根据 Logo 类型确定最终的值
      let finalLogo = '';
      if (logoType === 'url') {
        finalLogo = values.logoUrl || '';
        // 验证 URL 必须是 http 或 https
        if (finalLogo && !finalLogo.startsWith('http://') && !finalLogo.startsWith('https://')) {
          message.error('Logo URL 必须是 HTTP 或 HTTPS 地址');
          return;
        }
      } else if (logoType === 'upload') {
        finalLogo = logoPreview || '';
      }
      // logoType === 'none' 时 finalLogo 为空字符串

      if (config) {
        await sysConfigApi.update({
          ...config,
          ...values,
          siteLogo: finalLogo
        });
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
        <Space direction="vertical" style={{ width: '100%' }}>
          <Radio.Group
            value={logoType}
            onChange={(e) => handleLogoTypeChange(e.target.value)}
          >
            <Radio value="none">无Logo</Radio>
            <Radio value="url">使用 URL 地址</Radio>
            <Radio value="upload">上传图片</Radio>
          </Radio.Group>

          {logoType === 'url' && (
            <Form.Item
              name="logoUrl"
              noStyle
              rules={[
                {
                  pattern: /^https?:\/\/.+/,
                  message: '请输入有效的 HTTP 或 HTTPS 地址'
                }
              ]}
            >
              <Input
                placeholder="http://example.com/logo.png 或 https://example.com/logo.png"
                onChange={(e) => setLogoPreview(e.target.value)}
              />
            </Form.Item>
          )}

          {logoType === 'upload' && (
            <Upload
              accept="image/png,image/jpeg,image/jpg,image/svg,image/svg+xml"
              showUploadList={false}
              beforeUpload={handleImageUpload}
              maxCount={1}
            >
              <Button icon={<UploadCloud className="w-4 h-4" />}>
                选择图片 (JPG/PNG/SVG)
              </Button>
            </Upload>
          )}

          {logoPreview && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
              <img
                src={logoPreview}
                alt="预览"
                className="w-12 h-12 object-contain rounded"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMTYgMTZMMzIgMzJNMzIgMTZMMTYgMzIiIHN0cm9rZT0iIzlDQTNCQSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+';
                }}
              />
              <div className="flex-1">
                <div className="text-sm text-gray-600">Logo 预览</div>
                <div className="text-xs text-gray-400 mt-1 break-all">
                  {logoType === 'url' ? '外部链接' : `Base64 (${Math.round(logoPreview.length / 1024)}KB)`}
                </div>
              </div>
              <Button
                size="small"
                danger
                onClick={() => {
                  setLogoPreview('');
                  form.setFieldValue('siteLogo', '');
                  form.setFieldValue('logoUrl', '');
                }}
              >
                清除
              </Button>
            </div>
          )}

          <div className="text-xs text-gray-500">
            • 支持上传常规图片格式<br />
            • 支持使用 HTTP/HTTPS 图片地址<br />
            • Logo 可为空，将显示默认样式
          </div>
        </Space>
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
                  <Col xs={24} md={field.key === 'siteLogo' ? 24 : 12} key={field.key}>
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

              {/* 隐藏字段用于存储 siteLogo */}
              <Form.Item name="siteLogo" hidden>
                <Input />
              </Form.Item>

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

            <Divider />

            {/* 浏览器插件下载区域 */}
            <div>
              <h3 className="text-lg font-medium mb-4">浏览器插件</h3>
              <p className="text-sm text-gray-600 mb-4">
                下载 Oasis 导航助手插件，快速添加网页到您的导航系统
              </p>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Card
                    className="hover:shadow-md transition-shadow"
                    style={{ borderColor: '#1890ff' }}
                  >
                    <div className="text-center">
                      <div className="text-lg font-medium mb-2">Chrome / Edge</div>
                      <p className="text-sm text-gray-600 mb-4">
                        支持 Chrome 和 Edge 浏览器
                      </p>
                      <Button
                        type="primary"
                        icon={<Download className="w-4 h-4" />}
                        onClick={() => handleDownloadExtension('chrome')}
                        block
                      >
                        下载 Chrome 版本
                      </Button>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card
                    className="hover:shadow-md transition-shadow"
                    style={{ borderColor: '#ff7139' }}
                  >
                    <div className="text-center">
                      <div className="text-lg font-medium mb-2">Firefox</div>
                      <p className="text-sm text-gray-600 mb-4">
                        支持 Firefox 浏览器
                      </p>
                      <Button
                        type="primary"
                        icon={<Download className="w-4 h-4" />}
                        onClick={() => handleDownloadExtension('firefox')}
                        block
                        style={{ backgroundColor: '#ff7139', borderColor: '#ff7139' }}
                      >
                        下载 Firefox 版本
                      </Button>
                    </div>
                  </Card>
                </Col>
              </Row>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <h4 className="text-sm font-medium mb-2">安装说明：</h4>
                <ul className="text-xs text-gray-700 space-y-1 ml-4" style={{ listStyleType: 'disc' }}>
                  <li><strong>Chrome/Edge：</strong>下载后解压，打开扩展程序管理页面，开启开发者模式，加载已解压的扩展程序</li>
                  <li><strong>Firefox：</strong>下载后解压，打开 about:debugging，点击临时加载附加组件，选择 manifest.json</li>
                  <li>安装后在插件设置中配置API服务器地址（默认：http://localhost:9527）</li>
                  <li>右键点击任意页面，选择"添加到Oasis导航"即可快速添加</li>
                </ul>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SystemManagement;
