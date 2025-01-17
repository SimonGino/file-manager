import React from 'react';
import { Layout } from 'antd';
import UserMenu from '@/components/UserMenu';

const { Header, Content } = Layout;

const BasicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Layout>
      <Header style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        padding: '0 24px',
        boxShadow: '0 1px 4px rgba(0,21,41,.08)'
      }}>
        <div className="logo">Logo</div>
        <UserMenu />
      </Header>
      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
        {children}
      </Content>
    </Layout>
  );
};

export default BasicLayout; 