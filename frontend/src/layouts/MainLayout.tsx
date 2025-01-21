import React from 'react';
import { Layout, Menu, Button, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FileOutlined, ShareAltOutlined, LoginOutlined, LogoutOutlined } from '@ant-design/icons';
import UserMenu from '../components/UserMenu';
import Footer from '../components/Footer';
const { Header, Content } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('token');

  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/shared');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  // 动态生成菜单项
  const menuItems = [
    // 登录后才显示 Documents
    ...(isAuthenticated
      ? [
          {
            key: '/documents',
            icon: <FileOutlined />,
            label: 'Documents'
          }
        ]
      : []),
    // Shared 始终显示
    {
      key: '/shared',
      icon: <ShareAltOutlined />,
      label: 'Shared'
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 50px',
          position: 'fixed',
          top: 0,
          width: '100%',
          zIndex: 1
        }}
      >
        <div style={{ color: 'white', fontSize: '18px', marginRight: '24px' }}>Doc Management</div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1 }}
        />
        {isAuthenticated ? (
          <UserMenu />
        ) : (
          <Button type="link" icon={<LoginOutlined />} onClick={handleLogin} style={{ color: 'white' }}>
            Login
          </Button>
        )}
      </Header>
      <Content
        style={{
          padding: '24px 50px',
          marginTop: 64,
          maxWidth: '1400px',
          width: '100%',
          margin: '64px auto 0'
        }}
      >
        <div
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            padding: '24px',
            minHeight: '280px'
          }}
        >
          <Outlet />
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default MainLayout;
