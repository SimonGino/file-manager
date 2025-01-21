import React from 'react';
import { Card, Form, Input, Button, message, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import request from '@/utils/request';
import { LoginResponse } from '@/types/user';
import { setUserAuth } from '@/utils/auth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const formData = new FormData();
      formData.append('username', values.email);
      formData.append('password', values.password);
      formData.append('grant_type', 'password');

      const { user, access_token } = await request.post<any, LoginResponse>('/token', formData);
      setUserAuth(user, access_token);
      message.success('登录成功');
      navigate('/documents');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f0f2f5'
      }}
    >
      <Card title="Login" style={{ width: 400 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please input a valid email!' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" htmlType="submit" block>
                Login
              </Button>

              <Button type="link" onClick={() => navigate('/register')} block>
                Register Now
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
