import React, { useState } from 'react';
import { Modal, Form, Input, Button, App } from 'antd';
import { User, Lock } from 'lucide-react';

interface Props {
  visible: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => Promise<boolean>;
}

const LoginModal: React.FC<Props> = ({ visible, onClose, onLogin }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const success = await onLogin(values.username, values.password);
      if (success) {
        message.success('登录成功');
        // 登录成功后不调用 onClose，由父组件自己处理
        // onClose() 只用于取消登录时调用
        form.resetFields();
      } else {
        message.error('用户名或密码错误');
      }
    } catch (error: any) {
      const errorMessage = error?.message || '登录失败，请稍后重试';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="管理员登录"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      centered
      width={400}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input
            prefix={<User className="w-4 h-4 text-gray-400" />}
            placeholder="请输入用户名"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="密码"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password
            prefix={<Lock className="w-4 h-4 text-gray-400" />}
            placeholder="请输入密码"
            size="large"
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            className="w-full"
          >
            登录
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LoginModal;