import React from 'react';
import { Layout, Menu, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FileOutlined, LogoutOutlined, ShareAltOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/documents',
      icon: <FileOutlined />,
      label: 'Documents',
    },
    {
        key: '/shared',
        icon: <ShareAltOutlined />,
        label: 'Shared',
      },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 50px',
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 1,
      }}>
        <div style={{ color: 'white', fontSize: '18px', marginRight: '24px' }}>
          Doc Management
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => key !== 'logout' && navigate(key)}
          style={{ flex: 1 }}
        />
      </Header>
      <Content style={{ 
        padding: '24px 50px',
        marginTop: 64,
        maxWidth: '1400px',
        width: '100%',
        margin: '64px auto 0'
      }}>
        <div
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            padding: '24px',
            minHeight: '280px',
          }}
        >
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};

export default MainLayout; 